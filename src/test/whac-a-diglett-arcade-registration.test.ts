import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Whac-A-Diglett Arcade Integration', () => {
  const root = path.resolve(__dirname, '../..');

  it('has the game card artwork in public/pokeayman/assets/games/whac-a-diglett.jpg', () => {
    const imgPath = path.join(root, 'public', 'pokeayman', 'assets', 'games', 'whac-a-diglett.jpg');
    expect(fs.existsSync(imgPath)).toBe(true);
    const stat = fs.statSync(imgPath);
    expect(stat.size).toBeGreaterThan(10000); // valid image
  });

  it('registers Whac-A-Diglett in GAMES list in games-arcade.js', () => {
    const arcadeJsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
    const content = fs.readFileSync(arcadeJsPath, 'utf8');
    expect(content).toContain("fn: 'chooseWhacADiglett'");
    expect(content).toContain("name: 'Whac-A-Diglett'");
    expect(content).toContain("image: '/pokeayman/assets/games/whac-a-diglett.jpg'");
    expect(content).toContain("accent: 'amber'");
  });

  it('has whac-a-diglett.css and whac-a-diglett.js module created', () => {
    const cssPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.css');
    const jsPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.js');
    expect(fs.existsSync(cssPath)).toBe(true);
    expect(fs.existsSync(jsPath)).toBe(true);

    const jsContent = fs.readFileSync(jsPath, 'utf8');
    expect(jsContent).toContain('window.chooseWhacADiglett');
    expect(jsContent).toContain('window.openGameWhacADiglett');
  });

  it('inlines whac-a-diglett and links its stylesheet in index.html', () => {
    const htmlPath = path.join(root, 'public', 'pokeayman', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).toMatch(/href="\/pokeayman\/whac-a-diglett\.css(?:\?v=[^"]+)?"/);
    expect(html).toContain('data-pokeayman-inline="whac-a-diglett"');
    expect(html).toContain('window.chooseWhacADiglett');
    expect(html).toContain('isWhacADiglett');
  });

  it('supports student and teacher round setup with points stepper and robot opponent', () => {
    const arcadeJsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
    const arcadeJs = fs.readFileSync(arcadeJsPath, 'utf8');
    expect(arcadeJs).toContain("resolvedFnName === 'chooseWhacADiglett'");
    expect(arcadeJs).toContain("points: 10, label: '10 points'");
    expect(arcadeJs).toContain("isWhac = fnName === 'chooseWhacADiglett'");

    const whacJsPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.js');
    const whacJs = fs.readFileSync(whacJsPath, 'utf8');
    expect(whacJs).toContain('createRobotPlayer');
    expect(whacJs).toContain('whac-signboard');
    expect(whacJs).toContain('whac-combo');
    expect(whacJs).toContain('readGameWordAloud');
  });
});
