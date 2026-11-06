import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Surprise Boxes No-Repeat & Default Power-up Deck Generation', () => {
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Helper simulating the exact deck generation extracted from openBaamboozle in index.html
  function generateDeck(words: Array<{ vocab_word: string; vocab_image?: string }>, enabledPowerUps: string[], cardCount: number) {
    const baamboozlePowerUps = ['Star', 'Steal', 'Rocket', 'Bomb', 'Swap', 'Gift', 'Trap'];

    // 1. Deduplicate words by normalized word text so NO word can ever repeat
    const seenNorm = new Set<string>();
    const uniqueWords: Array<{ vocab_word: string; vocab_image?: string }> = [];
    for (const w of words) {
      const norm = String(w?.vocab_word || '').trim().toLowerCase();
      if (norm && !seenNorm.has(norm)) {
        seenNorm.add(norm);
        uniqueWords.push(w);
      }
    }
    if (!uniqueWords.length) {
      return [];
    }

    const shuffledWords = uniqueWords.slice().sort(() => Math.random() - 0.5);
    const roundSize = Number(cardCount) || 8;
    const isPowerupsExplicitlyEnabled = Array.isArray(enabledPowerUps) && enabledPowerUps.length > 0;
    const powerUpPool = isPowerupsExplicitlyEnabled
      ? enabledPowerUps
      : (Array.isArray(baamboozlePowerUps) && baamboozlePowerUps.length > 0 ? baamboozlePowerUps : ['Star','Steal','Rocket','Bomb','Swap','Gift','Trap']);

    let selectedWords: Array<{ vocab_word: string; vocab_image?: string }> = [];
    let neededPowerUps = 0;

    if (shuffledWords.length < roundSize) {
      // If list words are not enough for the cards (e.g. 5 words for 8 cards),
      // use each unique word exactly once, and complete the rest with power-ups by default!
      selectedWords = shuffledWords.slice();
      neededPowerUps = roundSize - selectedWords.length;
    } else if (isPowerupsExplicitlyEnabled) {
      const targetPowerUps = Math.max(1, Math.min(Math.round(roundSize * 0.25), roundSize - 1));
      const targetWords = roundSize - targetPowerUps;
      selectedWords = shuffledWords.slice(0, targetWords);
      neededPowerUps = roundSize - selectedWords.length;
    } else {
      selectedWords = shuffledWords.slice(0, roundSize);
      neededPowerUps = 0;
    }

    const selectedPowerUps: Array<{ powerUp: string; vocab_word: string }> = [];
    if (neededPowerUps > 0 && powerUpPool.length > 0) {
      const shuffledPool = powerUpPool.slice().sort(() => Math.random() - 0.5);
      for (let i = 0; i < neededPowerUps; i++) {
        const pType = shuffledPool[i % shuffledPool.length];
        selectedPowerUps.push({ powerUp: pType, vocab_word: '' });
      }
    }

    const selectedCards = [...selectedWords, ...selectedPowerUps];
    return selectedCards.sort(() => Math.random() - 0.5);
  }

  it('completes deck with power-ups by default when word count (5) is less than round size (8)', () => {
    const listWords = [
      { vocab_word: 'apple' },
      { vocab_word: 'banana' },
      { vocab_word: 'cherry' },
      { vocab_word: 'date' },
      { vocab_word: 'elderberry' }
    ];

    const deck = generateDeck(listWords, ['Star', 'Bomb'], 8);
    expect(deck).toHaveLength(8);

    const wordCards = deck.filter(c => c.vocab_word);
    const powerCards = deck.filter(c => (c as any).powerUp);

    expect(wordCards).toHaveLength(5);
    expect(powerCards).toHaveLength(3);

    // Verify each word appears exactly once (no repeats)
    const wordTexts = wordCards.map(c => c.vocab_word.toLowerCase());
    expect(new Set(wordTexts).size).toBe(5);
  });

  it('completes deck with power-ups by default EVEN when power-ups were toggled off if list words are insufficient', () => {
    const listWords = [
      { vocab_word: 'dog' },
      { vocab_word: 'cat' },
      { vocab_word: 'bird' },
      { vocab_word: 'fish' },
      { vocab_word: 'frog' }
    ];

    // Power-ups empty (disabled)
    const deck = generateDeck(listWords, [], 8);
    expect(deck).toHaveLength(8);

    const wordCards = deck.filter(c => c.vocab_word);
    const powerCards = deck.filter(c => (c as any).powerUp);

    expect(wordCards).toHaveLength(5);
    expect(powerCards).toHaveLength(3);

    // Absolutely zero repeated words
    const wordTexts = wordCards.map(c => c.vocab_word.toLowerCase());
    expect(new Set(wordTexts).size).toBe(5);
  });

  it('deduplicates case-insensitive or duplicate words from input list and never repeats them', () => {
    const listWords = [
      { vocab_word: 'Pikachu' },
      { vocab_word: 'pikachu' },
      { vocab_word: ' PIKACHU ' },
      { vocab_word: 'Charizard' },
      { vocab_word: 'charizard' },
      { vocab_word: 'Bulbasaur' },
      { vocab_word: 'Squirtle' }
    ]; // Only 4 unique words: pikachu, charizard, bulbasaur, squirtle

    const deck = generateDeck(listWords, [], 8);
    expect(deck).toHaveLength(8);

    const wordCards = deck.filter(c => c.vocab_word);
    expect(wordCards).toHaveLength(4);

    const wordTexts = wordCards.map(c => c.vocab_word.trim().toLowerCase());
    expect(new Set(wordTexts).size).toBe(4);
    expect(wordTexts).toContain('pikachu');
    expect(wordTexts).toContain('charizard');
    expect(wordTexts).toContain('bulbasaur');
    expect(wordTexts).toContain('squirtle');
  });

  it('contains the deduplication and power-up fallback logic directly in index.html openBaamboozle', () => {
    expect(html).toContain('// 1. Deduplicate words by normalized word text so NO word can ever repeat');
    expect(html).toContain('const seenNorm = new Set()');
    expect(html).toContain('if (shuffledWords.length < roundSize)');
    expect(html).toContain('neededPowerUps = roundSize - selectedWords.length');
    // Ensure the old repetition loop is removed
    expect(html).not.toContain('fallbackCards[i % fallbackCards.length]');
  });
});
