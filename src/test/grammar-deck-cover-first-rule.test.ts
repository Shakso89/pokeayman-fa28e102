import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Grammar Deck Cover Defaults to First Rule Picture', () => {
  const grammarJsPath = path.resolve(__dirname, '../../public/pokeayman/grammar-decks.js');
  const grammarJs = fs.readFileSync(grammarJsPath, 'utf8');

  it('defines window.resolveGrammarDeckCover to prioritize first rule picture', () => {
    expect(grammarJs).toContain('window.resolveGrammarDeckCover = function(deck)');
    expect(grammarJs).toContain('rules[0]?.image');
  });

  it('ensures resolveGrammarDeckCover logic accurately returns the first rule picture', () => {
    // Create a sandbox execution environment for resolveGrammarDeckCover
    const fnMatch = grammarJs.match(/window\.resolveGrammarDeckCover\s*=\s*function\(deck\)\s*\{([\s\S]*?)\n\s*\};/);
    expect(fnMatch).not.toBeNull();
    const fnBody = fnMatch![1];
    const resolveGrammarDeckCover = new Function('deck', fnBody);

    // Case 1: Deck with rules where first rule has an image
    const deckWithRules = {
      cover_image_url: 'https://example.com/old-elephant.jpg',
      rules: [
        { title: 'Rule 1', image: 'https://example.com/first-rule-soccer.jpg' },
        { title: 'Rule 2', image: 'https://example.com/second-rule.jpg' }
      ]
    };
    expect(resolveGrammarDeckCover(deckWithRules)).toBe('https://example.com/first-rule-soccer.jpg');

    // Case 2: Deck with rules where first rule has no image, but second rule does
    const deckRule2HasPic = {
      cover_image_url: '',
      rules: [
        { title: 'Rule 1', image: '' },
        { title: 'Rule 2', image: 'https://example.com/second-rule-cat.jpg' }
      ]
    };
    expect(resolveGrammarDeckCover(deckRule2HasPic)).toBe('https://example.com/second-rule-cat.jpg');

    // Case 3: Deck with no rules, falls back to cover_image_url
    const emptyDeckWithCover = {
      cover_image_url: 'https://example.com/custom-cover.jpg',
      rules: []
    };
    expect(resolveGrammarDeckCover(emptyDeckWithCover)).toBe('https://example.com/custom-cover.jpg');

    // Case 4: Deck with no rules and no cover
    const blankDeck = { rules: [] };
    expect(resolveGrammarDeckCover(blankDeck)).toBe('');
  });

  it('ensures renderClassroomGrammarDecks and renderGrammarBank use resolveGrammarDeckCover', () => {
    expect(grammarJs).toContain('const cover = (typeof window.resolveGrammarDeckCover === \'function\') ? window.resolveGrammarDeckCover(deck)');
  });

  it('ensures saveOrUpdateGrammarDeck syncs deck.cover_image_url with first rule pic', () => {
    expect(grammarJs).toContain('// Ensure cover of the grammar list by default is the first rule pic');
    expect(grammarJs).toContain('const defaultCover = (typeof window.resolveGrammarDeckCover === \'function\') ? window.resolveGrammarDeckCover(deck)');
  });

  it('ensures creating a new grammar deck does NOT hardcode the fallback elephant as cover', () => {
    // Both Classroom and Teacher Zone deck creations should initialize cover_image_url to ''
    const createDeckMatch = grammarJs.match(/newDeckId,\s*grammar_deck_name:\s*name,\s*[\s\S]*?cover_image_url:\s*'([^']*)'/);
    expect(createDeckMatch).not.toBeNull();
    expect(createDeckMatch![1]).toBe('');
  });
});
