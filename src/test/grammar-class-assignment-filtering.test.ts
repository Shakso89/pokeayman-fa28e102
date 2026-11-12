import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Grammar deck class-assignment filtering', () => {
  const grammarJsPath = path.resolve(__dirname, '../../public/pokeayman/grammar-decks.js');
  let mockWindow: any;

  beforeEach(() => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    mockWindow = {
      allData: [],
      document: { readyState: 'complete', addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] },
      addEventListener: () => {},
    } as any;
    (globalThis as any).allData = [];
    new Function('window', 'document', 'allData', js)(mockWindow, mockWindow.document, []);
  });

  function makeTestDeck(overrides: Record<string, any> = {}) {
    return {
      __backendId: overrides.id || 'deck-' + Math.random(),
      id: overrides.id || 'deck-' + Math.random(),
      grammar_deck_id: overrides.id || 'deck-' + Math.random(),
      grammar_deck_name: overrides.name || 'Test Deck',
      deck_name: overrides.name || 'Test Deck',
      school_name: overrides.school || 'Daya Stanford',
      class_name: overrides.class || 'ESL2',
      teacher_name: 'Teacher Ayman',
      owner: 'Teacher Ayman',
      created_by: 'Teacher Ayman',
      type: 'grammar_deck',
      rules: [],
      ...overrides,
    };
  }

  it('should NOT return starter decks assigned to ESL2 when filtering by class P3D', () => {
    // Starter decks are hard-coded with class_name: 'ESL2'
    const decks = mockWindow.getAllGrammarDecks('Daya Stanford', 'P3D');
    const starterIds = decks.filter((d: any) =>
      d.__backendId?.startsWith('starter-') || d.id?.startsWith('starter-')
    );
    expect(starterIds.length).toBe(0);
  });

  it('should return starter decks when filtering by their designated class ESL2', () => {
    const decks = mockWindow.getAllGrammarDecks('Daya Stanford', 'ESL2');
    const starterIds = decks.filter((d: any) =>
      d.__backendId?.startsWith('starter-') || d.id?.startsWith('starter-')
    );
    expect(starterIds.length).toBeGreaterThan(0);
  });

  it('should return a deck shared to P3D via shared_classes when filtering by P3D', () => {
    const testDeck = makeTestDeck({
      id: 'deck-shared-test',
      class: 'ESL2',
      school: 'Daya Stanford',
      shared_classes: ['P3D', 'ESL3'],
    });
    (globalThis as any).allData = [testDeck];
    mockWindow.allData = [testDeck];
    // Re-eval
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    new Function('window', 'document', 'allData', js)(mockWindow, mockWindow.document, [testDeck]);

    const decks = mockWindow.getAllGrammarDecks('Daya Stanford', 'P3D');
    const found = decks.find((d: any) => d.__backendId === 'deck-shared-test' || d.id === 'deck-shared-test');
    expect(found).toBeTruthy();
  });

  it('should NOT return a deck assigned to ESL2 when filtering by P3D (not shared)', () => {
    const testDeck = makeTestDeck({
      id: 'deck-esl2-only',
      class: 'ESL2',
      school: 'Daya Stanford',
    });
    (globalThis as any).allData = [testDeck];
    mockWindow.allData = [testDeck];
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    new Function('window', 'document', 'allData', js)(mockWindow, mockWindow.document, [testDeck]);

    const decks = mockWindow.getAllGrammarDecks('Daya Stanford', 'P3D');
    const found = decks.find((d: any) => d.__backendId === 'deck-esl2-only' || d.id === 'deck-esl2-only');
    expect(found).toBeFalsy();
  });

  it('should return all school decks (no class filter) for Grammar Bank view', () => {
    const deck1 = makeTestDeck({ id: 'deck-a', class: 'ESL2', school: 'Daya Stanford' });
    const deck2 = makeTestDeck({ id: 'deck-b', class: 'P3D', school: 'Daya Stanford' });
    const deck3 = makeTestDeck({ id: 'deck-c', class: 'ESL2', school: 'Other School' });
    (globalThis as any).allData = [deck1, deck2, deck3];
    mockWindow.allData = [deck1, deck2, deck3];
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    new Function('window', 'document', 'allData', js)(mockWindow, mockWindow.document, [deck1, deck2, deck3]);

    const decks = mockWindow.getAllGrammarDecks('Daya Stanford', '');
    const ids = decks.map((d: any) => d.__backendId || d.id);
    expect(ids).toContain('deck-a');
    expect(ids).toContain('deck-b');
    expect(ids).not.toContain('deck-c');
  });

  it('renderTeacherOwnedGrammarDecks scopes by school via navSchool', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    // The Grammar Bank function should reference navSchool for scoping
    expect(js).toContain('currentSchoolForBank');
    expect(js).toContain("navSchool !== 'undefined'");
  });

  it('getAllGrammarDecks does NOT have `if (isStarter) return true;` bypassing class filter', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');
    // Find the getAllGrammarDecks function
    const fnStart = js.indexOf('window.getAllGrammarDecks');
    const fnEnd = js.indexOf('function isCurrentTeacherOwner', fnStart);
    const fnBody = js.substring(fnStart, fnEnd);
    // Must NOT contain the old bypass
    expect(fnBody).not.toContain('if (isStarter) return true');
  });
});
