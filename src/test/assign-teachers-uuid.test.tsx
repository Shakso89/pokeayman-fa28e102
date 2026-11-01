import { describe, expect, it, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AssignTeachersModal, TeacherProfile } from '../components/classes/AssignTeachersModal';
import { awardTeacherCredits } from '../lib/teacher-credits';
import { supabase } from '../integrations/supabase/client';

vi.mock('../integrations/supabase/client', () => {
  const deleteMock = vi.fn();
  const insertMock = vi.fn();
  const eqClassMock = vi.fn().mockResolvedValue({ error: null });

  deleteMock.mockReturnValue({ eq: eqClassMock });
  insertMock.mockResolvedValue({ error: null });

  const rpcMock = vi.fn().mockResolvedValue({ data: { ok: true, balance: 15 }, error: null });

  const fromMock = vi.fn((table: string) => {
    if (table === 'class_teachers') {
      return {
        delete: deleteMock,
        insert: insertMock,
      };
    }
    return {
      delete: vi.fn(),
      insert: vi.fn(),
    };
  });

  return {
    supabase: {
      from: fromMock,
      rpc: rpcMock,
    },
  };
});

describe('Teacher Identity & Assignment by UUID (Deduplicate Same-Name Teachers)', () => {
  const teacherStan: TeacherProfile = {
    id: 'uuid-stan-001',
    name: 'Ayman Soliman',
    email: 'ayman.soliman.stan@gmail.com',
  };

  const teacherTr: TeacherProfile = {
    id: 'uuid-tr-002',
    name: 'Ayman Soliman',
    email: 'ayman.soliman.tr@gmail.com',
  };

  const teachers = [teacherStan, teacherTr];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('disambiguates teachers with identical display names by email and toggles independently by UUID', () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();

    render(
      <AssignTeachersModal
        isOpen={true}
        onClose={onClose}
        classId="class-uuid-999"
        className="Grade 4 English"
        schoolName="Stanford Academy"
        teachers={teachers}
        initialTeacherIds={['uuid-stan-001']}
        onSaved={onSaved}
      />
    );

    // Both teachers display their identical name but unique email
    const emails = screen.getAllByText(/ayman\.soliman\./i);
    expect(emails).toHaveLength(2);
    expect(screen.getByText('ayman.soliman.stan@gmail.com')).toBeDefined();
    expect(screen.getByText('ayman.soliman.tr@gmail.com')).toBeDefined();

    // The first teacher's card should be selected (has border-amber-500/50), the second should not
    const stanCard = screen.getByText('ayman.soliman.stan@gmail.com').closest('div[class*="rounded-xl"]');
    const trCard = screen.getByText('ayman.soliman.tr@gmail.com').closest('div[class*="rounded-xl"]');

    expect(stanCard?.className).toContain('border-amber-500/50');
    expect(trCard?.className).not.toContain('border-amber-500/50');

    // Click the second teacher to select them too
    fireEvent.click(trCard!);
    expect(trCard?.className).toContain('border-amber-500/50');

    // Click the first teacher to deselect them
    fireEvent.click(stanCard!);
    expect(stanCard?.className).not.toContain('border-amber-500/50');
    // Second teacher remains selected
    expect(trCard?.className).toContain('border-amber-500/50');
  });

  it('persists selected teacher assignments to class_teachers junction table using UUIDs', async () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();

    render(
      <AssignTeachersModal
        isOpen={true}
        onClose={onClose}
        classId="class-uuid-999"
        className="Grade 4 English"
        schoolName="Stanford Academy"
        teachers={teachers}
        initialTeacherIds={['uuid-stan-001']}
        onSaved={onSaved}
      />
    );

    const saveBtn = screen.getByRole('button', { name: /save teachers/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('class_teachers');
    });

    const classTeachersInstance = (supabase.from as any)('class_teachers');
    expect(classTeachersInstance.delete).toHaveBeenCalled();
    expect(classTeachersInstance.insert).toHaveBeenCalledWith([
      { class_id: 'class-uuid-999', teacher_id: 'uuid-stan-001' },
    ]);
    expect(onSaved).toHaveBeenCalledWith(['uuid-stan-001']);
    expect(onClose).toHaveBeenCalled();
  });

  it('awardTeacherCredits invokes supabase.rpc with p_teacher_id UUID', async () => {
    const result = await awardTeacherCredits('uuid-stan-001', 10, 'Outstanding participation');

    expect(supabase.rpc).toHaveBeenCalledWith('award_teacher_credits', {
      p_teacher_id: 'uuid-stan-001',
      p_amount: 10,
      p_reason: 'Outstanding participation',
    });
    expect(result).toEqual({ ok: true, balance: 15 });
  });

  it('awardTeacherCredits validates UUID and positive amount', async () => {
    await expect(awardTeacherCredits('', 10)).rejects.toThrow('Teacher UUID is required');
    await expect(awardTeacherCredits('uuid-stan-001', 0)).rejects.toThrow('Credit amount must be greater than 0');
    await expect(awardTeacherCredits('uuid-stan-001', -5)).rejects.toThrow('Credit amount must be greater than 0');
  });
});
