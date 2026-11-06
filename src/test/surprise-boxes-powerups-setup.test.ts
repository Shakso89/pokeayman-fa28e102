import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Surprise Boxes Power-ups Setup Integration', () => {
  const root = path.resolve(__dirname, '../..');
  const arcadeJsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
  const htmlPath = path.join(root, 'public', 'pokeayman', 'index.html');
  const classesRoutePath = path.join(root, 'src', 'routes', 'classes.tsx');
  const indexRoutePath = path.join(root, 'src', 'routes', 'index.tsx');

  it('includes Power-ups stepper in games-arcade.js for chooseBaamboozlePowerUps', () => {
    const arcadeJs = fs.readFileSync(arcadeJsPath, 'utf8');
    expect(arcadeJs).toContain("resolvedFnName === 'chooseBaamboozlePowerUps'");
    expect(arcadeJs).toContain("isSurpriseBoxesGame");
    expect(arcadeJs).toContain("title: 'Power-ups'");
    expect(arcadeJs).toContain("{ value: false, label: 'Disabled' }");
    expect(arcadeJs).toContain("{ value: true, label: 'Enabled' }");
    expect(arcadeJs).toContain("opt.value ? 'Traps, stars, swaps & gifts' : 'Vocabulary questions only'");
    expect(arcadeJs).toContain('modal.dataset.gaBaamPowerups = String(opt.value)');
    expect(arcadeJs).toContain("modal.querySelector('#shared-baam-powerups')");
  });

  it('inlines Power-ups stepper into index.html via sync-pokeayman-game-modules', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).toContain('data-pokeayman-inline="games-arcade"');
    expect(html).toContain("title: 'Power-ups'");
    expect(html).toContain("opt.value ? 'Traps, stars, swaps & gifts' : 'Vocabulary questions only'");
  });

  it('routes chooseBaamboozlePowerUps to chooseGamePlayers and assigns to window', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).toContain('window.chooseBaamboozlePowerUps = chooseBaamboozlePowerUps');
    expect(html).toContain("chooseGamePlayers(listName, chooseBaamboozlePowerUps)");
  });

  it('checks modal.dataset.gaBaamPowerups and #shared-baam-powerups on launch in index.html', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).toContain('modal.dataset.gaBaamPowerups');
    expect(html).toMatch(/isPowerupsEnabled\s*=\s*modal\.dataset\.gaBaamPowerups/);
    expect(html).toMatch(/modal\.querySelector\('#shared-baam-powerups'\)\?\.checked/);
  });

  it('uses updated cache buster on iframe in classes.tsx and index.tsx', () => {
    const classesRoute = fs.readFileSync(classesRoutePath, 'utf8');
    const indexRoute = fs.readFileSync(indexRoutePath, 'utf8');
    expect(classesRoute).toContain('v=20261106-surprise-powerups-v3');
    expect(indexRoute).toContain('v=20261106-surprise-powerups-v3');
  });
});
