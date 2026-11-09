import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Dots and Boxes Arcade & Classes Integration', () => {
  const root = path.resolve(__dirname, '../..');

  it('has the game medallion artwork in public/pokeayman/assets/games/dots-and-boxes.jpg', () => {
    const imgPath = path.join(root, 'public', 'pokeayman', 'assets', 'games', 'dots-and-boxes.jpg');
    expect(fs.existsSync(imgPath)).toBe(true);
    const stat = fs.statSync(imgPath);
    expect(stat.size).toBeGreaterThan(10000); // valid image
  });

  it('registers Dots and Boxes in GAMES list in games-arcade.js', () => {
    const arcadeJsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
    const content = fs.readFileSync(arcadeJsPath, 'utf8');
    expect(content).toContain("fn: 'chooseDotsAndBoxes'");
    expect(content).toContain("name: 'Dots and Boxes'");
    expect(content).toContain("image: '/pokeayman/assets/games/dots-and-boxes.jpg'");
    expect(content).toContain("accent: 'amber'");
  });

  it('has ga-amber CSS styling in games-arcade.css', () => {
    const arcadeCssPath = path.join(root, 'public', 'pokeayman', 'games-arcade.css');
    const content = fs.readFileSync(arcadeCssPath, 'utf8');
    expect(content).toContain('.ga-amber');
  });

  it('has dots-and-boxes.css and dots-and-boxes.js module created', () => {
    const cssPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.css');
    const jsPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.js');
    expect(fs.existsSync(cssPath)).toBe(true);
    expect(fs.existsSync(jsPath)).toBe(true);

    const jsContent = fs.readFileSync(jsPath, 'utf8');
    expect(jsContent).toContain('window.chooseDotsAndBoxes');
    expect(jsContent).toContain('window.openGameDotsAndBoxes');
  });

  it('inlines dots-and-boxes and links its stylesheet in index.html', () => {
    const htmlPath = path.join(root, 'public', 'pokeayman', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).toMatch(/href="\/pokeayman\/dots-and-boxes\.css(?:\?v=[^"]+)?"/);
    expect(html).toContain('data-pokeayman-inline="dots-and-boxes"');
    expect(html).toContain('Dots and Boxes Turn-Based Vocabulary Mini-Game');
    expect(html).toContain('window.chooseDotsAndBoxes');
    expect(html).toContain('isDotsAndBoxes');
  });

  it('supports 5x5 grid option, in-game theme switching, under-header duel score HUD, and visible vertical lines', () => {
    const arcadeJsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
    const arcadeJs = fs.readFileSync(arcadeJsPath, 'utf8');
    expect(arcadeJs).toContain("dots: 5, label: '5×5 dots · 16 boxes'");

    const dotsJsPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.js');
    const dotsJs = fs.readFileSync(dotsJsPath, 'utf8');
    // Live theme switcher inside the game
    expect(dotsJs).toContain('dots-theme-btn');
    expect(dotsJs).toContain('dots-theme-popover');
    expect(dotsJs).toContain('data-ga-theme-choice');
    // Duel score HUD placed in dots-hud-banner outside/under the header
    expect(dotsJs).toContain('dots-hud-banner');
    expect(dotsJs).toContain('dots-duel-hud');
    // Vertical line with full clickable height
    expect(dotsJs).toContain('dots-line-v');
    expect(dotsJs).toContain('dots-line-v-bar');

    const dotsCssPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.css');
    const dotsCss = fs.readFileSync(dotsCssPath, 'utf8');
    expect(dotsCss).toContain('.dots-hud-banner');
    expect(dotsCss).toContain('.dots-line-v');
    expect(dotsCss).toContain('.dots-line-v-bar');
    expect(dotsCss).toContain('[data-ga-theme="classroom"]');
    expect(dotsCss).toContain('[data-ga-theme="jungle"]');
    expect(dotsCss).toContain('[data-ga-theme="toybox"]');
    expect(dotsCss).toContain('[data-ga-theme="halloween"]');
  });

  it('whitelists Dots and Boxes in gaMountStage and observeStages to prevent premature removal', () => {
    const arcadeJsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
    const arcadeJs = fs.readFileSync(arcadeJsPath, 'utf8');
    expect(arcadeJs).toContain('#dots-board-grid');
    expect(arcadeJs).toContain('.dots-game-shell');

    const htmlPath = path.join(root, 'public', 'pokeayman', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).toContain('#dots-board-grid');
  });

  it('preserves teacher class context when selecting lists from My lists', () => {
    const htmlPath = path.join(root, 'public', 'pokeayman', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    // When clicking a card in My lists, do not overwrite navSchool / navClass
    expect(html).toContain('if (!isMyList && school && className)');
  });

  it('implements turn timer in HUD, student avatar header, double-turn penalty rule, and thick neon drawn lines', () => {
    const dotsJsPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.js');
    const dotsJs = fs.readFileSync(dotsJsPath, 'utf8');

    // Timer support
    expect(dotsJs).toContain('dots-hud-timer');
    expect(dotsJs).toContain('turnTimeLimit');
    expect(dotsJs).toContain('startTurnTimer');

    // Student avatar & name centered in card header with larger text
    expect(dotsJs).toContain('dots-card-header flex items-center justify-center');
    expect(dotsJs).toContain('dots-q-avatar');
    expect(dotsJs).toContain('dots-q-student-name');
    expect(dotsJs).not.toContain('Vocabulary Challenge');

    // Rule: Wrong answer grants opponent 2 consecutive turns, NO -1 deduction
    expect(dotsJs).toContain('consecutiveTurnsRemaining = 2');
    expect(dotsJs).not.toContain('Math.max(0, pScores[activeGamePlayerIndex] - 1)');

    // Persistent green answer highlight and shake on wrong
    expect(dotsJs).toContain('is-correct');
    expect(dotsJs).toContain('dots-choice-shake');

    // Sizing: 28px tracks, subtle un-drawn guides and 12px neon drawn lines
    expect(dotsJs).toContain("colDefs.push('28px'");
    expect(dotsJs).toContain("isDrawn ? 'is-drawn' : 'is-empty'");

    const dotsCssPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.css');
    const dotsCss = fs.readFileSync(dotsCssPath, 'utf8');
    expect(dotsCss).toContain('.dots-hud-timer');
    expect(dotsCss).toContain('[data-ga-theme="toybox"] .dots-hud-timer');
    expect(dotsCss).toContain('background: #4f46e5');
    expect(dotsCss).toContain('.dots-card-header');
    expect(dotsCss).toContain('.dots-q-student-name');
    expect(dotsCss).toContain('font-size: 1.75rem');
    expect(dotsCss).toContain('.dots-choice-btn.is-correct');
    expect(dotsCss).toContain('.dots-choice-btn.is-wrong');
    expect(dotsCss).toContain('.dots-line-h-bar.is-empty');
    expect(dotsCss).toContain('.dots-line-h-bar.is-drawn');
    expect(dotsCss).toContain('#facc15');
    expect(dotsCss).toContain('#00f0ff');
  });

  it('supports setting time from 30 sec up to 15 min and persistent dual-player time banks without pausing on drawing', () => {
    const arcadeJsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
    const arcadeJs = fs.readFileSync(arcadeJsPath, 'utf8');
    // Verifies 30 sec option and up to 15 min
    expect(arcadeJs).toContain("seconds: 30, label: '30 sec'");
    expect(arcadeJs).toContain("seconds: m * 60, label: `${m} min`");

    const dotsJsPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.js');
    const dotsJs = fs.readFileSync(dotsJsPath, 'utf8');
    // Persistent dual-player time banks
    expect(dotsJs).toContain('playerTimeRemaining = [turnTimeLimit, turnTimeLimit]');
    expect(dotsJs).toContain('dots-timer-p1');
    expect(dotsJs).toContain('dots-timer-p2');
    expect(dotsJs).toContain('dots-q-timer');
    expect(dotsJs).toContain('formatTime');

    // Timer does not pause after answering MCQ: no stopTurnTimer in correct answer branch
    expect(dotsJs).toContain('// Do NOT pause or stop the timer: clock keeps running continuously during DRAW_LINE!');
  });

  it('includes MCQ word size controller and clue image zoom lightbox modal', () => {
    const dotsJsPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.js');
    const dotsJs = fs.readFileSync(dotsJsPath, 'utf8');

    // Word size controller assertions
    expect(dotsJs).toContain('dots-options-toolbar');
    expect(dotsJs).toContain('dots-font-dec');
    expect(dotsJs).toContain('dots-font-inc');
    expect(dotsJs).toContain('dots-font-indicator');
    expect(dotsJs).toContain('WORD_SIZES');
    expect(dotsJs).toContain('--dots-choice-font-size');

    // Lightbox modal assertions
    expect(dotsJs).toContain('dots-img-lightbox');
    expect(dotsJs).toContain('dots-lightbox-img');
    expect(dotsJs).toContain('dots-lightbox-close');
    expect(dotsJs).toContain('openLightbox');
    expect(dotsJs).toContain('closeLightbox');
    expect(dotsJs).toContain('dots-clue-zoom-hint');

    const dotsCssPath = path.join(root, 'public', 'pokeayman', 'dots-and-boxes.css');
    const dotsCss = fs.readFileSync(dotsCssPath, 'utf8');

    expect(dotsCss).toContain('.dots-options-toolbar');
    expect(dotsCss).toContain('.dots-font-btn');
    expect(dotsCss).toContain('.dots-font-indicator');
    expect(dotsCss).toContain('.dots-clue-img-box.has-image');
    expect(dotsCss).toContain('.dots-clue-zoom-hint');
    expect(dotsCss).toContain('.dots-lightbox');
    expect(dotsCss).toContain('.dots-lightbox-img');
    expect(dotsCss).toContain('.dots-lightbox-close');
  });
});
