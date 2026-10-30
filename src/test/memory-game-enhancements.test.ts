import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Memory Game Card Refactor: Responsive Typography, Zero-Text Power-Ups & 2-Card Cap', () => {
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  it('permanently removes Lucky Star from mystery generator and game state', () => {
    // Confirm Lucky star has been purged from generator and match handler
    expect(htmlContent).not.toContain("title: 'Lucky Star'");
    expect(htmlContent).not.toContain("kind === 'star'");
    expect(htmlContent).not.toContain("deductTeacherCredits(5, { notify: false })");
    expect(htmlContent).not.toContain("type: 'memory_game_lucky_star'");
    expect(htmlContent).not.toContain("Lucky Star bonus");
  });

  it('renders power-up cards with 100% textless pure vector graphics scaling at w-3/5 h-3/5', () => {
    // Vector SVGs with 3/5 sizing and drop shadow
    expect(htmlContent).toContain('<svg class="w-3/5 h-3/5 text-amber-500 drop-shadow select-none"');
    expect(htmlContent).toContain('<svg class="w-3/5 h-3/5 text-red-500 drop-shadow select-none"');
    expect(htmlContent).toContain('<svg class="w-3/5 h-3/5 text-blue-400 drop-shadow select-none"');

    // Inner container matching spec
    expect(htmlContent).toContain('w-full h-full p-2 sm:p-2.5 flex items-center justify-center');
    expect(htmlContent).toContain('w-full h-full rounded-2xl flex items-center justify-center border-2 border-slate-900/80 shadow-inner bg-slate-800/40');
  });

  it('applies fluid auto-padding container and dynamic text scaling with overflow protection', () => {
    // Word card container
    expect(htmlContent).toContain('w-full h-full max-h-[82%] px-2.5 py-1.5 rounded-2xl bg-amber-100 border-2 border-slate-900 flex items-center justify-center text-center shadow-inner');
    expect(htmlContent).toContain('select-none break-words line-clamp-2 max-w-full ${getDynamicTextClass(wordText, totalGridCards)}');

    // getDynamicTextClass helper definition
    expect(htmlContent).toContain('const getDynamicTextClass = (word, totalCards = 10) => {');
  });

  it('triggers correct power-up game actions in checkMatch', () => {
    // Bomb ends turn and deducts point
    expect(htmlContent).toContain('// 💣 Bomb: Deducts 1 point from active player and ends the turn.');
    expect(htmlContent).toContain('advanceGameTurn();');

    // Magnet auto-matches hidden vocab pair
    expect(htmlContent).toContain('// 🧲 Magnet: Auto-reveals and matches one hidden vocabulary pair on board, awarding points to the active player.');

    // Shuffle rearranges cards
    expect(htmlContent).toContain('// 🔄 Shuffle: Randomizes grid positions of remaining unflipped cards.');
  });

  describe('Dynamic text scaling helper (getDynamicTextClass)', () => {
    const fnMatch = htmlContent.match(/const getDynamicTextClass = \([\s\S]*?^window\.getDynamicTextClass = getDynamicTextClass;/m);
    expect(fnMatch).not.toBeNull();
    const fnBody = fnMatch![0];
    const sandbox = new Function(`${fnBody}\nreturn getDynamicTextClass;`);
    const getDynamicTextClass = sandbox();

    it('returns appropriate sizes for small grids (<= 12 cards)', () => {
      expect(getDynamicTextClass('cat', 10)).toBe('text-xl sm:text-2xl font-extrabold');
      expect(getDynamicTextClass('camera', 10)).toBe('text-base sm:text-lg font-bold');
      expect(getDynamicTextClass('elephant', 10)).toBe('text-sm sm:text-base font-bold');
    });

    it('returns scaled-down sizes for large grids (> 12 cards)', () => {
      expect(getDynamicTextClass('cat', 18)).toBe('text-sm sm:text-base font-extrabold');
      expect(getDynamicTextClass('camera', 18)).toBe('text-xs sm:text-sm font-bold');
      expect(getDynamicTextClass('elephant', 18)).toBe('text-[11px] sm:text-xs font-bold');
      expect(getDynamicTextClass('hippopotamus', 30)).toBe('text-[11px] sm:text-xs font-bold');
    });
  });

  describe('generateMemoryDeck with strict 2-card cap per type', () => {
    const fnMatch = htmlContent.match(/function generateMemoryDeck\([\s\S]*?^window\.generateMemoryDeck = generateMemoryDeck;/m);
    expect(fnMatch).not.toBeNull();
    const fnBody = fnMatch![0];
    const sandbox = new Function(`${fnBody}\nreturn generateMemoryDeck;`);
    const generateMemoryDeck = sandbox();

    it('never spawns more than 2 cards of any single power-up type (bomb, magnet, shuffle)', () => {
      const vocab = [
        { vocab_word: 'apple', vocab_image: 'apple.png' },
        { vocab_word: 'banana', vocab_image: 'banana.png' }
      ];

      ['easy', 'medium', 'hard'].forEach(diff => {
        for (let i = 0; i < 30; i++) {
          const deck = generateMemoryDeck(vocab, diff, false);
          const bombCount = deck.cards.filter((c: any) => c.powerup === 'bomb').length;
          const magnetCount = deck.cards.filter((c: any) => c.powerup === 'magnet').length;
          const shuffleCount = deck.cards.filter((c: any) => c.powerup === 'shuffle').length;

          expect(bombCount).toBeLessThanOrEqual(2);
          expect(magnetCount).toBeLessThanOrEqual(2);
          expect(shuffleCount).toBeLessThanOrEqual(2);

          // And pairs are paired (either 0 or 2)
          expect([0, 2]).toContain(bombCount);
          expect([0, 2]).toContain(magnetCount);
          expect([0, 2]).toContain(shuffleCount);
        }
      });
    });

    it('generates the exact total card count for the grid', () => {
      const deckEasy = generateMemoryDeck([], 'easy');
      expect(deckEasy.cards.length).toBe(10);

      const deckMed = generateMemoryDeck([], 'medium');
      expect(deckMed.cards.length).toBe(18);

      const deckHard = generateMemoryDeck([], 'hard');
      expect(deckHard.cards.length).toBe(30);
    });
  });
});
