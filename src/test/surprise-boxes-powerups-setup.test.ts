import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Surprise Boxes Power-ups Setup Integration', () => {
  const root = path.resolve(__dirname, '../..');
  const arcadeJsPath = path.join(root, 'public', 'pokeayman', 'games-arcade.js');
  const htmlPath = path.join(root, 'public', 'pokeayman', 'index.html');

  it('includes Power-ups stepper in games-arcade.js for chooseBaamboozlePowerUps', () => {
    const arcadeJs = fs.readFileSync(arcadeJsPath, 'utf8');
    expect(arcadeJs).toContain("resolvedFnName === 'chooseBaamboozlePowerUps'");
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

  it('checks modal.dataset.gaBaamPowerups and #shared-baam-powerups on launch in index.html', () => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    expect(html).toContain('modal.dataset.gaBaamPowerups');
    expect(html).toMatch(/isPowerupsEnabled\s*=\s*modal\.dataset\.gaBaamPowerups/);
    expect(html).toMatch(/modal\.querySelector\('#shared-baam-powerups'\)\?\.checked/);
  });
});
