import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Memory Game Enhancements & Economy Rules', () => {
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  it('standardizes copy for Radar, Ditto, Lucky Star, Bomb, and Time Boost', () => {
    // Check titles and subtitles in generateMemoryDeck
    expect(htmlContent).toContain("title: 'Radar',\n        subtitle: 'Free Pair'");
    expect(htmlContent).toContain("title: 'Ditto',\n        subtitle: 'Shuffle'");
    expect(htmlContent).toContain("title: 'Bomb',\n        subtitle: '-1 Point'");
    expect(htmlContent).toContain("title: 'Lucky Star',\n          subtitle: '+5 Coins'");
    expect(htmlContent).toContain("title: 'Time Boost',\n        subtitle: '+10s Timer'");
  });

  it('applies unified inner container layout to power-up cards to prevent text clipping', () => {
    // Check inner container layout structure
    expect(htmlContent).toContain('w-[90%] h-[90%] rounded-2xl bg-gradient-to-b ${m.gradient} border-2 border-slate-900 flex flex-col items-center justify-between py-2 px-1 shadow-inner overflow-hidden select-none');
    expect(htmlContent).toContain('<div class="flex-shrink-0 w-8 h-8 flex items-center justify-center text-2xl leading-none filter drop-shadow">');
    expect(htmlContent).toContain('<span class="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate max-w-full">');
    expect(htmlContent).toContain('<span class="font-bold text-slate-800 text-[10px] sm:text-xs leading-tight mt-0.5 truncate max-w-full">');
  });

  it('configures true 3D flip transform with backface-visibility hidden and white card back', () => {
    // Check 3D flip styles
    expect(htmlContent).toContain('transform-style: preserve-3d;');
    expect(htmlContent).toContain('-webkit-transform-style: preserve-3d;');
    expect(htmlContent).toContain('transform: rotateY(180deg);');
    expect(htmlContent).toContain('backface-visibility: hidden !important;');
    expect(htmlContent).toContain('-webkit-backface-visibility: hidden !important;');
    expect(htmlContent).toContain('background: #ffffff !important;');
  });

  it('uses dynamic 1fr grid and aspect-ratio on cards without hardcoded pixel card heights', () => {
    expect(htmlContent).toContain("grid.style.gridTemplateColumns = `repeat(${best.cols}, 1fr)`;");
    expect(htmlContent).toContain("grid.style.gridTemplateRows = `repeat(${best.rows}, 1fr)`;");
    expect(htmlContent).toContain("grid.style.maxWidth = `${targetGridW}px`;");
    expect(htmlContent).toContain("grid.style.maxHeight = `${targetGridH}px`;");
    expect(htmlContent).toContain('aspect-ratio: 1 / 1;');
  });

  it('freezes active theme token at game mount to prevent theme flickering', () => {
    expect(htmlContent).toContain('modal.dataset.frozenTheme = frozenThemeId;');
    expect(htmlContent).toContain('activeMemoryTheme?.cardBackSvg ? `<div class="ga-card-back-art w-full h-full flex items-center justify-center p-2" data-theme-id="${frozenThemeId}" aria-hidden="true">${activeMemoryTheme.cardBackSvg}</div>`');
  });

  it('enforces Lucky Star teacher credit deduction, coin award, and audit logging', () => {
    // Check checkMatch handling for star
    expect(htmlContent).toContain('deductTeacherCredits(5, { notify: false })');
    expect(htmlContent).toContain("persistCanonicalStudentPatch(stableId, { coins: newCoins }, 'Lucky Star bonus')");
    expect(htmlContent).toContain("type: 'memory_game_lucky_star'");
    expect(htmlContent).toContain('amount: 5');
  });

  describe('generateMemoryDeck logic simulation', () => {
    // Extract generateMemoryDeck implementation from index.html for live unit testing
    const fnMatch = htmlContent.match(/function generateMemoryDeck\([\s\S]*?^window\.generateMemoryDeck = generateMemoryDeck;/m);
    expect(fnMatch).not.toBeNull();
    const fnBody = fnMatch![0];

    // Create an isolated sandbox function
    const createDeckGenerator = (mockTeacherCredits: number) => {
      const sandbox = new Function(
        'getTeacherCredits',
        `
        ${fnBody}
        return generateMemoryDeck;
        `
      );
      return sandbox(() => mockTeacherCredits);
    };

    it('never spawns Lucky Star if teacher has 0 credits remaining', () => {
      const generateDeck = createDeckGenerator(0);
      // Run multiple iterations to verify 0% probability
      for (let i = 0; i < 50; i++) {
        const deck = generateDeck([], 'easy', false);
        const starCards = deck.cards.filter((c: any) => c.type === 'mystery' && c.mystery.kind === 'star');
        expect(starCards.length).toBe(0);
      }
    });

    it('never spawns Lucky Star if teacher has insufficient credits (< 5)', () => {
      const generateDeck = createDeckGenerator(4);
      for (let i = 0; i < 50; i++) {
        const deck = generateDeck([], 'easy', false);
        const starCards = deck.cards.filter((c: any) => c.type === 'mystery' && c.mystery.kind === 'star');
        expect(starCards.length).toBe(0);
      }
    });

    it('spawns at most 1 pair of Lucky Star per game when teacher has sufficient credits', () => {
      const generateDeck = createDeckGenerator(20);
      for (let i = 0; i < 100; i++) {
        const deck = generateDeck([], 'hard', false); // 15 pairs needed
        const starCards = deck.cards.filter((c: any) => c.type === 'mystery' && c.mystery.kind === 'star');
        // Either 0 or 2 cards (1 pair)
        expect([0, 2]).toContain(starCards.length);
      }
    });

    it('only includes Time Boost when isTimerActive is true', () => {
      const generateDeck = createDeckGenerator(20);
      // Timer inactive
      for (let i = 0; i < 20; i++) {
        const deckNoTimer = generateDeck([], 'hard', false);
        const timeCardsNoTimer = deckNoTimer.cards.filter((c: any) => c.type === 'mystery' && c.mystery.kind === 'time');
        expect(timeCardsNoTimer.length).toBe(0);
      }

      // Timer active
      let foundTimeBoost = false;
      for (let i = 0; i < 20; i++) {
        const deckTimer = generateDeck([], 'hard', true);
        const timeCardsTimer = deckTimer.cards.filter((c: any) => c.type === 'mystery' && c.mystery.kind === 'time');
        if (timeCardsTimer.length > 0) {
          foundTimeBoost = true;
          break;
        }
      }
      expect(foundTimeBoost).toBe(true);
    });
  });
});
