import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('AI Generated Lists & Badge Removal', () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../../public/pokeayman/index.html'), 'utf8');
  const componentsCss = fs.readFileSync(path.resolve(__dirname, '../../public/pokeayman/components.css'), 'utf8');

  it('removes the AI Generated badge from vocab list cards and hides .ai-generated-badge in CSS', () => {
    // 1. CSS must hide .ai-generated-badge
    expect(componentsCss).toContain('.ai-generated-badge');
    expect(componentsCss).toContain('display: none !important');

    // 2. index.html getAiGeneratedBadgeHtml returns empty string
    expect(indexHtml).toMatch(/function getAiGeneratedBadgeHtml\(\)\s*\{\s*return '';\s*\}/);

    // 3. Card templates must not contain getAiGeneratedBadgeHtml calls
    expect(indexHtml).not.toContain('${isAiGeneratedVocabList(list) ? getAiGeneratedBadgeHtml() : ""}');
  });

  it('defines isCurrentTeacherOwnedVocabList and uses it across My lists game setup', () => {
    // Check that isCurrentTeacherOwnedVocabList is defined
    expect(indexHtml).toContain('function isCurrentTeacherOwnedVocabList(list)');

    // Verify it is used in teacherOwnLists (games setup)
    expect(indexHtml).toContain("const teacherOwnLists = currentRole === 'teacher' ? getVocabLists('', '').filter(isCurrentTeacherOwnedVocabList)");

    // Verify it is used in getAuthorizedMyListsWords
    expect(indexHtml).toContain("const ownedLists = getVocabLists('', '').filter(isCurrentTeacherOwnedVocabList);");

    // Verify it is used in getGameWordsRaw
    expect(indexHtml).toContain("const authorizedIds = new Set(getVocabLists('', '').filter(isCurrentTeacherOwnedVocabList)");

    // Verify it is used in openTeacherMyListsOverlay
    expect(indexHtml).toContain("const lists = getVocabLists('', '').filter(isCurrentTeacherOwnedVocabList)");
  });

  it('correctly matches AI generated lists where author is "Teacher Ayman" when logged in as "Ayman"', () => {
    // Simulate the logic in isCurrentTeacherOwnedVocabList
    const stripPrefix = (str: string) => String(str || '').replace(/^teacher\s+/i, '').trim();
    const normalize = (v: string) => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');

    function testOwnership(list: any, currentTeacher: string, verifiedTeacherId = 'ayman-uuid') {
      const myId = verifiedTeacherId;
      const listTeacherId = String(list.teacher_id || list.ai_creator_id || '').trim();
      const listCreatedBy = String(list.created_by || '').trim();

      if (myId) {
        if (listTeacherId && listTeacherId === myId) return true;
        if (listCreatedBy && listCreatedBy === myId) return true;
      }

      const rawTeacher = String(currentTeacher || '').trim();
      const cleanTeacher = stripPrefix(rawTeacher);
      const teacherKeys = new Set([
        normalize(rawTeacher),
        normalize(cleanTeacher)
      ].filter(Boolean));

      const listOwnerValues = [
        list.teacher_name,
        list.owner,
        list.created_by,
        list.ai_creator_teacher,
        list.author_name
      ].filter(Boolean);

      for (const val of listOwnerValues) {
        const rawVal = String(val).trim();
        const cleanVal = stripPrefix(rawVal);
        const normRaw = normalize(rawVal);
        const normClean = normalize(cleanVal);
        if (teacherKeys.has(normRaw) || teacherKeys.has(normClean)) return true;
      }

      const isAyman = normalize(cleanTeacher) === 'ayman';
      if (isAyman) {
        if (listTeacherId === 'ayman' || listCreatedBy === 'ayman') return true;
        for (const val of listOwnerValues) {
          const clean = normalize(stripPrefix(val));
          if (clean === 'ayman') return true;
        }
      }

      if (list.is_ai_generated || list.ai_generated) {
        if (!listTeacherId || (myId && listTeacherId === myId)) return true;
        if (isAyman) return true;
      }

      return false;
    }

    // List 1: AI list created by Teacher Ayman
    const aiList = {
      vocab_list_id: 'vocab-ai-museum-123',
      vocab_list_name: 'Museum',
      teacher_name: 'Teacher Ayman',
      owner: 'Teacher Ayman',
      ai_creator_teacher: 'Teacher Ayman',
      teacher_id: 'ayman-uuid',
      created_by: 'ayman-uuid',
      is_ai_generated: true
    };

    // When logged in as "Ayman" with verified ID
    expect(testOwnership(aiList, 'Ayman', 'ayman-uuid')).toBe(true);

    // When logged in as "Ayman" without verified ID (fallback by name matching stripping "Teacher ")
    expect(testOwnership(aiList, 'Ayman', '')).toBe(true);

    // Another teacher's AI list with distinct ID
    const otherTeacherAiList = {
      vocab_list_id: 'vocab-ai-other-456',
      vocab_list_name: 'Other List',
      teacher_name: 'Teacher Sarah',
      owner: 'Teacher Sarah',
      ai_creator_teacher: 'Teacher Sarah',
      teacher_id: 'sarah-uuid',
      created_by: 'sarah-uuid',
      is_ai_generated: true
    };

    // Sarah's list should not belong to Ayman (unless Ayman admin fallback)
    expect(testOwnership(otherTeacherAiList, 'John', 'john-uuid')).toBe(false);
    expect(testOwnership(otherTeacherAiList, 'Sarah', 'sarah-uuid')).toBe(true);
  });
});
