import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('PokeAyman Class & Student Profile DOM Hierarchy', () => {
  const indexPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');

  it('ensures view-student-profile is a sibling of view-students and not nested inside it', () => {
    // Parse using JSDOM or substring hierarchy
    const parser = new DOMParser();
    const doc = parser.parseFromString(indexHtml, 'text/html');

    const viewStudents = doc.getElementById('view-students');
    const viewStudentProfile = doc.getElementById('view-student-profile');

    expect(viewStudents).not.toBeNull();
    expect(viewStudentProfile).not.toBeNull();

    // view-student-profile must NOT be inside view-students
    expect(viewStudents!.contains(viewStudentProfile)).toBe(false);
  });

  it('ensures class-subtab-vocab, class-subtab-games, and class-subtab-battle are siblings of class-subtab-quiz', () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(indexHtml, 'text/html');

    const quizSubtab = doc.getElementById('class-subtab-quiz');
    const vocabSubtab = doc.getElementById('class-subtab-vocab');
    const gamesSubtab = doc.getElementById('class-subtab-games');
    const battleSubtab = doc.getElementById('class-subtab-battle');

    expect(quizSubtab).not.toBeNull();
    expect(vocabSubtab).not.toBeNull();
    expect(gamesSubtab).not.toBeNull();
    expect(battleSubtab).not.toBeNull();

    // None of the other class subtabs should be nested inside the quiz subtab
    expect(quizSubtab!.contains(vocabSubtab)).toBe(false);
    expect(quizSubtab!.contains(gamesSubtab)).toBe(false);
    expect(quizSubtab!.contains(battleSubtab)).toBe(false);

    // They must all share the same parent container (#view-students)
    expect(vocabSubtab!.parentElement).toBe(quizSubtab!.parentElement);
    expect(gamesSubtab!.parentElement).toBe(quizSubtab!.parentElement);
    expect(battleSubtab!.parentElement).toBe(quizSubtab!.parentElement);
  });
});
