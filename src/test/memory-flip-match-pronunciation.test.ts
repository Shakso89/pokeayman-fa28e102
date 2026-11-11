import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Memory Flip match word pronunciation', () => {
  const memoryJsPath = path.resolve(__dirname, '../../public/pokeayman/memory-flip.js');
  const arcadeJsPath = path.resolve(__dirname, '../../public/pokeayman/games-arcade.js');
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');

  const memoryJs = fs.readFileSync(memoryJsPath, 'utf8');
  const arcadeJs = fs.readFileSync(arcadeJsPath, 'utf8');
  const html = fs.readFileSync(htmlPath, 'utf8');

  it('correctly extracts string vocab_word from matched cards instead of passing the raw object', () => {
    // Should extract vocab_word text from card object
    expect(memoryJs).toContain('firstCard?.word?.vocab_word');
    expect(html).toContain('firstCard?.word?.vocab_word');
    // Must NOT blindly pass the word object: firstCard?.word || firstCard?.wordObj
    expect(memoryJs).not.toMatch(/const matchedWord = firstCard\?\.word \|\|/);
  });

  it('readGameWordAloud guards against objects and [object Object]', () => {
    expect(arcadeJs).toContain("word && typeof word === 'object'");
    expect(arcadeJs).toContain("clean === '[object Object]'");
    expect(html).toContain("word && typeof word === 'object'");
    expect(html).toContain("clean === '[object Object]'");
  });

  it('simulates word extraction when card contains standard vocab word object', () => {
    const firstCard = {
      pairId: 'memory-pair-0-elephant',
      cardId: 'memory-pair-0-elephant-word',
      type: 'word',
      word: { vocab_word: 'elephant', vocab_image: 'https://example.com/elephant.png' }
    };
    const secondCard = {
      pairId: 'memory-pair-0-elephant',
      cardId: 'memory-pair-0-elephant-image',
      type: 'image',
      word: { vocab_word: 'elephant', vocab_image: 'https://example.com/elephant.png' }
    };

    const matchedWord = String(
      firstCard?.word?.vocab_word ||
      (typeof firstCard?.word === 'string' ? firstCard.word : '') ||
      secondCard?.word?.vocab_word ||
      (typeof secondCard?.word === 'string' ? secondCard.word : '') ||
      ''
    ).trim();

    expect(matchedWord).toBe('elephant');
    expect(matchedWord).not.toBe('[object Object]');
  });
});
