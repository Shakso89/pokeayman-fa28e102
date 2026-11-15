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

  it('features live visual theme switcher, standard arcade stage header, and direct fullscreen toggle', () => {
    const whacJsPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.js');
    const whacJs = fs.readFileSync(whacJsPath, 'utf8');

    // Theme selector
    expect(whacJs).toContain('whac-theme-wrap');
    expect(whacJs).toContain('whac-theme-btn');
    expect(whacJs).toContain('whac-theme-popover');
    expect(whacJs).toContain('data-ga-theme-choice');

    // Header controls & direct fullscreen
    expect(whacJs).toContain('whac-header ga-stage-header');
    expect(whacJs).toContain('whac-fullscreen-btn');
    expect(whacJs).toContain('modal.requestFullscreen()');
    expect(whacJs).toContain('whac-sound-toggle');
    expect(whacJs).toContain('whac-close-btn');

    // Duel HUD and high-contrast score box
    expect(whacJs).toContain('whac-duel-hud');
    expect(whacJs).toContain('whac-player-badge');
    expect(whacJs).toContain('whac-target-pill');

    const whacCssPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.css');
    const whacCss = fs.readFileSync(whacCssPath, 'utf8');
    expect(whacCss).toContain('[data-ga-theme="classroom"]');
    expect(whacCss).toContain('[data-ga-theme="jungle"]');
    expect(whacCss).toContain('[data-ga-theme="toybox"]');
    expect(whacCss).toContain('[data-ga-theme="halloween"]');
    expect(whacCss).toContain('.whac-duel-hud');
  });

  it('implements authentic 3D hole layers, unclipped hammer animation, and hides spelling on picture clues', () => {
    const whacJsPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.js');
    const whacJs = fs.readFileSync(whacJsPath, 'utf8');

    // 3D hole layers
    expect(whacJs).toContain('whac-hole-back');
    expect(whacJs).toContain('whac-hole-pit');
    expect(whacJs).toContain('whac-burrow-chamber');
    expect(whacJs).toContain('whac-mound-front');

    // Hammer animation & uncropped strike
    expect(whacJs).toContain('renderHammerStrike');
    expect(whacJs).toContain('whac-hammer-anim');

    // When picture exists, spelling is hidden
    expect(whacJs).toContain("clueText.classList.add('hidden')");
    expect(whacJs).toContain("clueText.textContent = ''");

    const whacCssPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.css');
    const whacCss = fs.readFileSync(whacCssPath, 'utf8');
    expect(whacCss).toContain('.whac-hole-back');
    expect(whacCss).toContain('.whac-hole-pit');
    expect(whacCss).toContain('.whac-burrow-chamber');
    expect(whacCss).toContain('.whac-mound-front');
    expect(whacCss).toContain('.whac-hammer-anim');
    expect(whacCss).toContain('whac-hammer-strike');
  });

  it('implements complete immersive themes across signboard, mounds, badges, HUD and playing field', () => {
    const whacCssPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.css');
    const whacCss = fs.readFileSync(whacCssPath, 'utf8');
    const themes = ['classroom', 'jungle', 'toybox', 'halloween', 'classic'];

    for (const theme of themes) {
      // Must style stage/modal background
      expect(whacCss).toContain(`.whac-game-modal[data-ga-theme="${theme}"]`);
      // Must style signboard
      expect(whacCss).toContain(`.whac-game-modal[data-ga-theme="${theme}"] .whac-signboard`);
      // Must style mound front
      expect(whacCss).toContain(`.whac-game-modal[data-ga-theme="${theme}"] .whac-mound-front`);
      // Must style word badge
      expect(whacCss).toContain(`.whac-game-modal[data-ga-theme="${theme}"] .whac-word-badge`);
      // Must style duel HUD
      expect(whacCss).toContain(`.whac-game-modal[data-ga-theme="${theme}"] .whac-duel-hud`);
    }

    const whacJsPath = path.join(root, 'public', 'pokeayman', 'whac-a-diglett.js');
    const whacJs = fs.readFileSync(whacJsPath, 'utf8');
    expect(whacJs).toContain("modal.setAttribute('data-ga-theme', initialThemeObj.id)");
    expect(whacJs).toContain("modal.setAttribute('data-ga-theme', themeId)");
  });
});
