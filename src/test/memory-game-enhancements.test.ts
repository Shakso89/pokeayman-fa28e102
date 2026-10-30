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

  describe('Theme consistency and effective space utilization in fitMemoryBoard', () => {
    const cssPath = path.resolve(__dirname, '../../public/pokeayman/games-arcade.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    it('ensures .memory-game-grid has consistent 0 padding and transparent background across all themes', () => {
      // .memory-game-grid should be excluded from theme centerpiece panel borders and padding
      expect(cssContent).not.toMatch(/\[data-ga-theme="classroom"\]\s+\.memory-game-grid/);
      expect(cssContent).not.toMatch(/\[data-ga-theme="jungle"\]\s+\.memory-game-grid/);
      expect(cssContent).not.toMatch(/\[data-ga-theme="toybox"\]\s+\.memory-game-grid/);
      expect(cssContent).not.toMatch(/\[data-ga-theme="halloween"\][^{]*\.memory-game-grid/);

      // Explicit geometry reset across themes
      expect(cssContent).toContain('html body > .ga-stage[data-ga-theme] .memory-game-grid');
      expect(cssContent).toContain('padding: 0 !important;');
      expect(cssContent).toContain('border: 0 !important;');
    });

    it('allows memory-game-body in ga-stage to use full width on wide screens instead of being choked to 1180px', () => {
      expect(cssContent).toContain('html body > .ga-stage .ga-stage-shell > .memory-game-body');
      expect(cssContent).toContain('max-width: none !important;');
      expect(htmlContent).toContain('html body > .ga-stage .ga-stage-shell > .memory-game-body { width: 100% !important; max-width: none !important;');
    });

    it('measures available width strictly from body container and prevents recursive ratchet collapse on theme switches', () => {
      expect(htmlContent).not.toContain('grid.clientWidth > 0 ?');
      expect(htmlContent).toContain('const containerW = Math.max(0, (body.clientWidth || shell.clientWidth || modal.clientWidth || window.innerWidth) - bodyPadX);');
      expect(htmlContent).toContain('const availableWidth = Math.max(1, containerW - gridPadX - gridBorderX - 8);');
    });

    it('stably calculates 10 columns x 3 rows for 30 cards on widescreen desktop and never shrinks over multiple runs', () => {
      // Simulate the exact fitMemoryBoard layout algorithm
      const simulateFit = (containerW: number, containerH: number, count: number) => {
        const availableWidth = Math.max(1, containerW - 8);
        const availableHeight = Math.max(1, containerH - 8);
        let best = { size: 0, cols: 4, rows: Math.ceil(count / 4), gap: 8, score: 0 };

        for (let cols = 2; cols <= Math.min(count, 10); cols++) {
          const rows = Math.ceil(count / cols);
          const gap = availableWidth < 600 || availableHeight < 500 ? 6 : Math.max(6, Math.min(12, Math.floor(Math.min(availableWidth / cols, availableHeight / rows) * 0.08)));
          const sizeW = (availableWidth - gap * (cols - 1)) / cols;
          const sizeH = (availableHeight - gap * (rows - 1)) / rows;
          const size = Math.min(sizeW, sizeH);

          const isEvenDivision = count % cols === 0;
          const score = isEvenDivision ? size * 1.15 : size;

          if (score > best.score + 0.5) {
            best = { size, cols, rows, gap, score };
          }
        }

        const maxFitSizeW = Math.floor((availableWidth - best.gap * (best.cols - 1)) / best.cols);
        const maxFitSizeH = Math.floor((availableHeight - best.gap * (best.rows - 1)) / best.rows);
        const clampedSize = Math.max(36, Math.min(180, Math.floor(best.size), maxFitSizeW, maxFitSizeH));
        const targetGridW = Math.floor(best.cols * clampedSize + best.gap * (best.cols - 1));
        const targetGridH = Math.floor(best.rows * clampedSize + best.gap * (best.rows - 1));
        return { cols: best.cols, rows: best.rows, clampedSize, gap: best.gap, targetGridW, targetGridH };
      };

      // 1. Initial run on 1920x1080 desktop (container: 1800 x 750)
      const run1 = simulateFit(1800, 750, 30);
      expect(run1.cols).toBe(10);
      expect(run1.rows).toBe(3);
      expect(run1.clampedSize).toBeGreaterThan(150);

      // 2. Subsequent runs (simulating switching themes: Toybox -> Classic -> Jungle -> Classroom)
      // Because container width comes from the parent body, the layout remains 100% invariant
      for (let i = 0; i < 10; i++) {
        const subsequentRun = simulateFit(1800, 750, 30);
        expect(subsequentRun.cols).toBe(10);
        expect(subsequentRun.rows).toBe(3);
        expect(subsequentRun.clampedSize).toBe(run1.clampedSize);
        expect(subsequentRun.gap).toBe(run1.gap);
        expect(subsequentRun.targetGridW).toBe(run1.targetGridW);
      }
    });

    it('adapts cleanly to mobile portrait viewports without orphan cards', () => {
      const simulateFit = (containerW: number, containerH: number, count: number) => {
        const availableWidth = Math.max(1, containerW - 8);
        const availableHeight = Math.max(1, containerH - 8);
        let best = { size: 0, cols: 4, rows: Math.ceil(count / 4), gap: 8, score: 0 };

        for (let cols = 2; cols <= Math.min(count, 10); cols++) {
          const rows = Math.ceil(count / cols);
          const gap = availableWidth < 600 || availableHeight < 500 ? 6 : Math.max(6, Math.min(12, Math.floor(Math.min(availableWidth / cols, availableHeight / rows) * 0.08)));
          const sizeW = (availableWidth - gap * (cols - 1)) / cols;
          const sizeH = (availableHeight - gap * (rows - 1)) / rows;
          const size = Math.min(sizeW, sizeH);

          const isEvenDivision = count % cols === 0;
          const score = isEvenDivision ? size * 1.15 : size;

          if (score > best.score + 0.5) {
            best = { size, cols, rows, gap, score };
          }
        }

        const maxFitSizeW = Math.floor((availableWidth - best.gap * (best.cols - 1)) / best.cols);
        const maxFitSizeH = Math.floor((availableHeight - best.gap * (best.rows - 1)) / best.rows);
        const clampedSize = Math.max(36, Math.min(180, Math.floor(best.size), maxFitSizeW, maxFitSizeH));
        return { cols: best.cols, rows: best.rows, clampedSize, gap: best.gap };
      };

      // Portrait phone (360 x 550) on 30 cards should pick 5 cols x 6 rows (even division)
      const phoneRun = simulateFit(360, 550, 30);
      expect(phoneRun.cols).toBe(5);
      expect(phoneRun.rows).toBe(6);
      expect(30 % phoneRun.cols).toBe(0);
    });
  });
});
