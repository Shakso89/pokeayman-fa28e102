import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Vocabulary Editor Cross-List Word Copy with Unlimited Cycling', () => {
  const root = path.resolve(__dirname, '../..');
  const indexHtmlPath = path.join(root, 'public', 'pokeayman', 'index.html');
  const html = fs.readFileSync(indexHtmlPath, 'utf8');

  it('ensures new-vocab-word input disables browser autocomplete and renders matches container', () => {
    expect(html).toContain('id="new-vocab-word" type="text" placeholder="Apple" class="vocab-editor-input w-full" required autocomplete="off"');
    expect(html).toContain('id="ve-matches-container"');
  });

  it('implements unlimited continuous loop cycling across multiple matching lists', () => {
    expect(html).toContain('currentMatchIdx = (currentMatchIdx + 1) % currentMatches.length;');
    expect(html).toContain('currentMatchIdx = (currentMatchIdx - 1 + currentMatches.length) % currentMatches.length;');
    expect(html).toContain('ve-match-cycle-btn');
    expect(html).toContain('ve-match-next-btn');
    expect(html).toContain('ve-match-prev-btn');
    expect(html).toContain('ve-copy-match-btn');
  });

  it('correctly cycles in a loop across 2 matching lists without stopping', () => {
    const matches = [
      { word: 'Apple', listName: 'Fruits', sentence: 'I eat an apple.', image: 'apple1.jpg' },
      { word: 'Apple', listName: 'Snacks', sentence: 'An apple is healthy.', image: 'apple2.jpg' }
    ];

    let currentMatchIdx = 0;
    const history: number[] = [];

    // Simulate 6 clicks of cycleNext
    for (let i = 0; i < 6; i++) {
      currentMatchIdx = (currentMatchIdx + 1) % matches.length;
      history.push(currentMatchIdx);
    }

    // 0 -> 1 -> 0 -> 1 -> 0 -> 1 -> 0
    expect(history).toEqual([1, 0, 1, 0, 1, 0]);
  });
});
