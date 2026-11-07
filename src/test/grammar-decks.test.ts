import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Grammar Tab & Grammar Bank Integration', () => {
  const indexPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const grammarJsPath = path.resolve(__dirname, '../../public/pokeayman/grammar-decks.js');
  const componentsCssPath = path.resolve(__dirname, '../../public/pokeayman/components.css');

  it('ensures index.html contains the Grammar class subtab and tab button', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Tab button in class-tabs-container
    expect(html).toContain('data-classtab="grammar"');
    expect(html).toContain('🧩 Grammar');

    // Class subtab container
    expect(html).toContain('id="class-subtab-grammar"');
    expect(html).toContain('id="new-grammar-deck-name"');
    expect(html).toContain('id="create-grammar-deck-btn"');
    expect(html).toContain('id="generate-grammar-deck-btn"');
    expect(html).toContain('id="grammar-decks-container"');
    expect(html).toContain('id="grammar-decks-empty"');
  });

  it('ensures class-subtab-grammar is a sibling of class-subtab-vocab and class-subtab-games inside #view-students', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Parse simple DOM check
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const viewStudents = doc.getElementById('view-students');
    expect(viewStudents).not.toBeNull();

    const vocabTab = doc.getElementById('class-subtab-vocab');
    const grammarTab = doc.getElementById('class-subtab-grammar');
    const gamesTab = doc.getElementById('class-subtab-games');
    const battleTab = doc.getElementById('class-subtab-battle');

    expect(vocabTab).not.toBeNull();
    expect(grammarTab).not.toBeNull();
    expect(gamesTab).not.toBeNull();
    expect(battleTab).not.toBeNull();

    // Verify all are siblings under viewStudents
    expect(vocabTab?.parentElement).toBe(viewStudents);
    expect(grammarTab?.parentElement).toBe(viewStudents);
    expect(gamesTab?.parentElement).toBe(viewStudents);
    expect(battleTab?.parentElement).toBe(viewStudents);
  });

  it('ensures Teacher Zone contains Grammar Bank tab and panel with Mine vs School modes', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Tab button in Teacher Zone
    expect(html).toContain('id="teacher-zone-grammar-decks-tab"');
    expect(html).toContain('Grammar Bank');

    // Panel
    expect(html).toContain('id="teacher-zone-grammar-decks-panel"');
    expect(html).toContain('id="teacher-grammar-mode-mine"');
    expect(html).toContain('id="teacher-grammar-mode-school"');
    expect(html).toContain('id="teacher-grammar-open-create"');
    expect(html).toContain('id="teacher-grammar-open-ai"');
    expect(html).toContain('id="teacher-grammar-search-field"');
    expect(html).toContain('id="teacher-grammar-search-query"');
    expect(html).toContain('id="teacher-grammar-decks-status"');
    expect(html).toContain('id="teacher-grammar-decks-grid"');
  });

  it('ensures grammar-decks.js is loaded in index.html', () => {
    const html = fs.readFileSync(indexPath, 'utf-8');
    expect(html).toContain('<script src="/pokeayman/grammar-decks.js"></script>');
  });

  it('ensures grammar-decks.js contains required functions, starter decks, and creator attribution', () => {
    const js = fs.readFileSync(grammarJsPath, 'utf-8');

    expect(js).toContain('getAllGrammarDecks');
    expect(js).toContain('renderClassGrammarDecks');
    expect(js).toContain('renderTeacherOwnedGrammarDecks');
    expect(js).toContain('openGrammarDeckPractice');
    expect(js).toContain('openGrammarDeckPracticeById');
    expect(js).toContain('openGrammarDeckEditor');
    expect(js).toContain('openGrammarAiGeneratorModal');
    expect(js).toContain('openGrammarSharePopupFor');
    expect(js).toContain('deleteGrammarDeck');

    // Checks that cards show creator name
    expect(js).toContain('By <b class="text-amber-300 font-semibold">${escapeHtml(teacher)}</b>');
    expect(js).toContain('Teacher Ayman');
  });

  it('ensures components.css styles grammar deck buttons and containers', () => {
    const css = fs.readFileSync(componentsCssPath, 'utf-8');
    expect(css).toContain('#class-subtab-grammar');
    expect(css).toContain('#create-grammar-deck-btn');
    expect(css).toContain('#teacher-grammar-open-create');
    expect(css).toContain('#teacher-grammar-mode-mine');
    expect(css).toContain('#teacher-grammar-mode-school');
  });
});
