import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { WordBankVocabCard, WordBankCardList } from '../components/classes/WordBankVocabCard';

describe('UI Theme Audit: Light Mode Buttons & Components', () => {
  const mockList: WordBankCardList = {
    id: 'vocab-list-test-1',
    title: 'Halloween Treats',
    word_count: 5,
    cover_image_url: 'https://images.unsplash.com/photo-halloween',
    author_name: 'Teacher Ayman',
    class_name: 'Grade 3',
    school_name: 'Stanford Academy',
  };

  it('renders WordBankVocabCard with theme-aware classes for Flashcards, Assign, and actions', () => {
    const onOpenFlashcards = vi.fn();
    const onAssignToClass = vi.fn();
    const onEditList = vi.fn();
    const onDeleteList = vi.fn();
    const onChangeCover = vi.fn();

    render(
      <WordBankVocabCard
        list={mockList}
        onOpenFlashcards={onOpenFlashcards}
        onAssignToClass={onAssignToClass}
        onEditList={onEditList}
        onDeleteList={onDeleteList}
        onChangeCover={onChangeCover}
      />
    );

    // Flashcard button has light and dark theme styles
    const flashcardsBtn = screen.getByRole('button', { name: /flashcards/i });
    expect(flashcardsBtn.className).toContain('bg-amber-50');
    expect(flashcardsBtn.className).toContain('text-amber-800');
    expect(flashcardsBtn.className).toContain('dark:bg-amber-400/15');
    expect(flashcardsBtn.className).toContain('dark:text-amber-300');

    // Assign button has clean light-mode and dark-mode styles
    const assignBtn = screen.getByRole('button', { name: /assign/i });
    expect(assignBtn.className).toContain('bg-slate-50');
    expect(assignBtn.className).toContain('text-slate-700');
    expect(assignBtn.className).toContain('dark:bg-slate-800/80');
    expect(assignBtn.className).toContain('dark:text-slate-300');

    // Edit button has light background in light mode
    const editBtn = screen.getByRole('button', { name: /edit halloween treats/i });
    expect(editBtn.className).toContain('bg-white');
    expect(editBtn.className).toContain('dark:bg-slate-800');

    // Delete button has light background with rose text in light mode
    const deleteBtn = screen.getByRole('button', { name: /delete halloween treats/i });
    expect(deleteBtn.className).toContain('bg-white');
    expect(deleteBtn.className).toContain('text-rose-500');
    expect(deleteBtn.className).toContain('dark:bg-slate-800');
    expect(deleteBtn.className).toContain('dark:text-rose-400');
  });
});
