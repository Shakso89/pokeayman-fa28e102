import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Memory Game Engine: Single-Card Instant Trigger Power-Ups & Pure Vector Visuals', () => {
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const memoryGameSlice = htmlContent.slice(
    htmlContent.indexOf('function generateMemoryDeck'),
    htmlContent.indexOf('function chooseScrambleWordCount')
  );

  it('permanently purges lucky_star and teacher credit deductions from memory game', () => {
    // lucky_star, star cards, and teacher credit deductions must be completely absent from memory game
    expect(memoryGameSlice).not.toContain("type: 'memory_game_lucky_star'");
    expect(memoryGameSlice).not.toContain("deductTeacherCredits");
    expect(memoryGameSlice).not.toContain("Lucky Star");
    expect(memoryGameSlice).not.toContain("luckyStarAssigned");
  });

  it('defines the active power-up roster strictly as Bomb, Magnet, and Shuffle without pairs', () => {
    expect(memoryGameSlice).toContain("const powerUpPool = ['bomb', 'magnet', 'shuffle'];");
    expect(memoryGameSlice).toContain("isPowerUp: true");
    expect(memoryGameSlice).toContain("pairId: cardId"); // single card, no matching pair needed
  });

  it('renders pure vector SVG graphics with responsive w-3/5 h-3/5 and zero text badges', () => {
    // Vector SVGs
    expect(memoryGameSlice).toContain('class="w-3/5 h-3/5 select-none"');
    // Pure cartoon bomb vector
    expect(memoryGameSlice).toContain('<path d="M50 36 C50 20 64 24 66 14" stroke="#d97706"');
    // Bold red horseshoe magnet vector
    expect(memoryGameSlice).toContain('<path d="M22 28 V58 C22 74 34 86 50 86 C66 86 78 74 78 58 V28 H62 V56 C62 63 57 68 50 68 C43 68 38 63 38 56 V28 H22 Z" fill="#dc2626"');
    // Circular dual cycling arrows shuffle vector
    expect(memoryGameSlice).toContain('<path d="M30 32 C35 24 44 20 54 20 C68 20 80 30 82 44" stroke="#7c3aed"');
    // No text badges on power-up cards
    expect(memoryGameSlice).not.toContain('${m.subtitle}');
    expect(memoryGameSlice).not.toContain('${m.desc}');
  });

  it('wires the flip state machine to instantly trigger single power-up cards upon reveal', () => {
    // State machine check
    expect(memoryGameSlice).toContain('if (cardData.isPowerUp || cardData.type === \'powerup\')');
    expect(memoryGameSlice).toContain('triggerInstantPowerUp(idx, card, cardData)');
    // Power-up pulse animation
    expect(memoryGameSlice).toContain('cardEl.classList.add(\'memory-card-powerup-pulse\')');
    expect(memoryGameSlice).toContain('@keyframes gaPowerupPulse');
  });

  it('executes distinct instant behaviors for Bomb, Magnet, and Shuffle', () => {
    // Bomb: screen shake, sound, -1 score, passes turn
    expect(memoryGameSlice).toContain('shell.classList.add(\'ga-board-shake\')');
    expect(memoryGameSlice).toContain('playTransactionSound(\'deduction\')');
    expect(memoryGameSlice).toContain('advanceGameTurn()');

    // Magnet: finds, reveals, matches, and clears 1 hidden vocab pair
    expect(memoryGameSlice).toContain('targetPairId = pairs[i].pairId;');
    expect(memoryGameSlice).toContain('matched.add(r1);');
    expect(memoryGameSlice).toContain('matched.add(r2);');

    // Shuffle: swaps positions of unflipped cards and lets active player continue
    expect(memoryGameSlice).toContain('toShuffle.forEach(c => c.classList.add(\'ga-ditto-wobble\'))');
    expect(memoryGameSlice).toContain('shuffledNodes.forEach(node => parent.appendChild(node))');
  });

  it('configures true 3D flip transform with backface-visibility hidden and white card back', () => {
    expect(memoryGameSlice).toContain('transform-style: preserve-3d;');
    expect(memoryGameSlice).toContain('-webkit-transform-style: preserve-3d;');
    expect(memoryGameSlice).toContain('transform: rotateY(180deg);');
    expect(memoryGameSlice).toContain('backface-visibility: hidden !important;');
    expect(memoryGameSlice).toContain('-webkit-backface-visibility: hidden !important;');
    expect(memoryGameSlice).toContain('background: #ffffff !important;');
  });

  it('uses dynamic 1fr grid and aspect-ratio on cards without hardcoded pixel card heights', () => {
    expect(memoryGameSlice).toContain("grid.style.gridTemplateColumns = `repeat(${best.cols}, 1fr)`;");
    expect(memoryGameSlice).toContain("grid.style.gridTemplateRows = `repeat(${best.rows}, 1fr)`;");
    expect(memoryGameSlice).toContain("grid.style.maxWidth = `${targetGridW}px`;");
    expect(memoryGameSlice).toContain("grid.style.maxHeight = `${targetGridH}px`;");
    expect(memoryGameSlice).toContain('aspect-ratio: 1 / 1;');
  });

  it('freezes active theme token at game mount to prevent theme flickering', () => {
    expect(memoryGameSlice).toContain('modal.dataset.frozenTheme = frozenThemeId;');
    expect(memoryGameSlice).toContain('activeMemoryTheme?.cardBackSvg ? `<div class="ga-card-back-art w-full h-full flex items-center justify-center p-2" data-theme-id="${frozenThemeId}" aria-hidden="true">${activeMemoryTheme.cardBackSvg}</div>`');
  });

  describe('generateMemoryDeck logic simulation', () => {
    // Extract generateMemoryDeck implementation from index.html for live unit testing
    const fnMatch = htmlContent.match(/function generateMemoryDeck\([\s\S]*?^window\.generateMemoryDeck = generateMemoryDeck;/m);
    expect(fnMatch).not.toBeNull();
    const fnBody = fnMatch![0];

    const generateDeck = new Function(
      `
      ${fnBody}
      return generateMemoryDeck;
      `
    )();

    it('generates exact pairs for vocabulary words', () => {
      const vocab = [
        { vocab_word: 'apple' },
        { vocab_word: 'banana' },
        { vocab_word: 'cherry' },
        { vocab_word: 'date' },
        { vocab_word: 'elderberry' }
      ];
      const deck = generateDeck(vocab, 'easy');
      expect(deck.totalGridCards).toBe(10);
      expect(deck.cards.length).toBe(10);
      expect(deck.missingCards).toBe(0);
      // All 10 are vocabulary cards (5 pairs of word & image)
      const wordCards = deck.cards.filter((c: any) => c.type === 'word');
      const imageCards = deck.cards.filter((c: any) => c.type === 'image');
      expect(wordCards.length).toBe(5);
      expect(imageCards.length).toBe(5);
    });

    it('calculates missingCards = totalGridCards - (vocabList.length * 2) and fills with single power-ups', () => {
      const shortVocab = [
        { vocab_word: 'apple' },
        { vocab_word: 'banana' }
      ];
      // Easy = 5 pairs = 10 cards. 2 words = 4 vocab cards. missingCards = 6.
      const deck = generateDeck(shortVocab, 'easy');
      expect(deck.totalGridCards).toBe(10);
      expect(deck.cards.length).toBe(10);
      expect(deck.missingCards).toBe(6);

      const powerUps = deck.cards.filter((c: any) => c.isPowerUp);
      expect(powerUps.length).toBe(6);

      // Verify all powerups are single cards with strictly bomb, magnet, or shuffle
      const allowedEffects = new Set(['bomb', 'magnet', 'shuffle']);
      powerUps.forEach((p: any) => {
        expect(allowedEffects.has(p.effect)).toBe(true);
        expect(p.pairId).toBe(p.cardId); // single card
      });
    });

    it('fills an odd or even number of gap slots individually without requiring pairs', () => {
      // 3 words on Medium (9 pairs = 18 cards). 3 * 2 = 6 vocab cards. 12 powerups.
      const deck = generateDeck([{ vocab_word: 'a' }, { vocab_word: 'b' }, { vocab_word: 'c' }], 'medium');
      expect(deck.cards.length).toBe(18);
      expect(deck.missingCards).toBe(12);
      const powerUps = deck.cards.filter((c: any) => c.isPowerUp);
      expect(powerUps.length).toBe(12);

      // Verify each power-up card has a unique cardId
      const cardIds = new Set(powerUps.map((p: any) => p.cardId));
      expect(cardIds.size).toBe(12);
    });
  });
});
