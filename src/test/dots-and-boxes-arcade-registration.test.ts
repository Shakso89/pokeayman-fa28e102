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

  it('preserves teacher class context when selecting lists from My lists', () => {
    const htmlPath = path.join(root, 'public', 'pokeayman', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    // When clicking a card in My lists, do not overwrite navSchool / navClass
    expect(html).toContain('if (!isMyList && school && className)');
  });
});
