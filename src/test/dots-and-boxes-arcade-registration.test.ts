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
});
