import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Games & Visual Polish integration', () => {
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const arcadePath = path.resolve(__dirname, '../../public/pokeayman/games-arcade.js');
  const arcadeJs = fs.readFileSync(arcadePath, 'utf8');

  it('enables Surprise Boxes for students in arcade GAMES list and student setup', () => {
    // games-arcade.js GAMES entry for Surprise Boxes must not have teacherOnly: true
    const baamArcadeMatch = arcadeJs.match(/fn:\s*'chooseBaamboozlePowerUps'[\s\S]*?accent:\s*'pink'/);
    expect(baamArcadeMatch).toBeTruthy();
    expect(baamArcadeMatch![0]).not.toContain('teacherOnly: true');

    // games-arcade.js gaStudentSetup must support chooseBaamboozlePowerUps
    expect(arcadeJs).toContain("fnName === 'chooseBaamboozlePowerUps'");
    expect(arcadeJs).toContain("openBaamboozle(listName, typeof baamboozlePowerUps !== 'undefined' ? baamboozlePowerUps : [], count)");
  });

  it('includes "🎮 Other Games" button in showGameCelebration, Surprise Boxes, and Battle finish overlays', () => {
    // showGameCelebration
    expect(html).toContain('id="celebration-hub"');
    expect(html).toContain('overlay.querySelector(\'#celebration-hub\')');

    // openBaamboozle celebration overlay
    expect(html).toContain('id="baam-final-hub"');
    expect(html).toContain('overlay.querySelector(\'#baam-final-hub\')');

    // showBattleWinnerCelebration
    expect(html).toContain('id="battle-celebration-hub"');
    expect(html).toContain('overlay.querySelector(\'#battle-celebration-hub\')');

    // hangman game over
    expect(html).toContain('id="hangman-game-over-hub"');
    expect(html).toContain('gameOverOverlay.querySelector(\'#hangman-game-over-hub\')');
  });

  it('hooks up global pokeSfx audio in game sound and action triggers', () => {
    // playGameSound dispatches through pokeSfx when available
    expect(html).toContain("if (window.pokeSfx && !window.pokeSfx.isMuted())");
    expect(html).toContain("window.pokeSfx.play('whoosh')");
    expect(html).toContain("window.pokeSfx.play('correct')");
    expect(html).toContain("window.pokeSfx.play('wrong')");
    expect(html).toContain("window.pokeSfx.play('fanfare')");

    // Surprise Boxes plays sound on pop and power-ups
    expect(html).toContain("window.pokeSfx?.play?.('pop')");
    expect(html).toContain("window.pokeSfx?.play?.('star')");
    expect(html).toContain("window.pokeSfx?.play?.('rocket')");
    expect(html).toContain("window.pokeSfx?.play?.('boom')");
  });
});
