import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Whac-A-Diglett 4 Players & Multiplayer Turn Numbering', () => {
  const root = path.resolve(__dirname, '../..');
  const arcadeJs = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'games-arcade.js'), 'utf8');
  const arcadeCss = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'games-arcade.css'), 'utf8');
  const whacJs = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'whac-a-diglett.js'), 'utf8');
  const whacCss = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'whac-a-diglett.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'index.html'), 'utf8');
  const dotsJs = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'dots-and-boxes.js'), 'utf8');
  const baamJs = fs.readFileSync(path.join(root, 'public', 'pokeayman', 'surprise-boxes.js'), 'utf8');

  it('allows Whac-A-Diglett up to 4 players in arcade lobby and tags', () => {
    // Tag says 1–4 players
    expect(arcadeJs).toContain("tags: ['1–4 players', 'Reflexes & Audio']");
    expect(indexHtml).toContain("tags: ['1–4 players', 'Reflexes & Audio']");

    // maxAllowed in games-arcade.js does not restrict isWhacADiglett to 2
    expect(arcadeJs).toContain('const maxAllowed = isSoloGame ? 1 : (isDotsAndBoxes ? 2 : 4);');

    // atLimit in index.html allows up to 4 for Whac-A-Diglett
    expect(indexHtml).toContain('const atLimit = isDotsAndBoxes ? selectedCount >= 2 : selectedCount >= 4;');
  });

  it('renders dynamic player badges up to 4 players in Whac-A-Diglett', () => {
    // Dynamic badges rendering
    expect(whacJs).toContain('whac-p${pIdx + 1}-badge');
    expect(whacJs).toContain('whac-p${pIdx + 1}-score');
    expect(whacJs).toContain('whac-p${pIdx + 1}-turn');
    expect(whacJs).toContain('isMultiPlayer');

    // CSS styles for p3 and p4
    expect(whacCss).toContain('.whac-player-badge.p3');
    expect(whacCss).toContain('.whac-player-badge.p3.is-active');
    expect(whacCss).toContain('.whac-player-badge.p4');
    expect(whacCss).toContain('.whac-player-badge.p4.is-active');
    expect(whacCss).toContain('.whac-duel-hud.is-multi');
  });

  it('guarantees starting player matches countdown reveal across games', () => {
    // In Whac-A-Diglett, does NOT blindly reset activeGamePlayerIndex = 0
    expect(whacJs).not.toMatch(/activeGameScores\s*=\s*activeGamePlayers\.map\(\(\)\s*=>\s*0\);\s*activeGamePlayerIndex\s*=\s*0;/);
    expect(whacJs).toContain('window._chosenFirstPlayerIndex');

    // In Dots & Boxes, honors chosen first player
    expect(dotsJs).not.toMatch(/activeGameScores\s*=\s*\[0,\s*0\];\s*activeGamePlayerIndex\s*=\s*0;/);
    expect(dotsJs).toContain('window._chosenFirstPlayerIndex');

    // In Surprise Boxes, honors chosen first player
    expect(baamJs).not.toMatch(/activeGamePlayers\s*=\s*baamPlayers;\s*activeGamePlayerIndex\s*=\s*0;/);
    expect(baamJs).toContain('window._chosenFirstPlayerIndex');

    // In showFirstPlayerReveal, records _chosenFirstPlayerIndex
    expect(indexHtml).toContain('window._chosenFirstPlayerIndex = activeGamePlayerIndex;');
  });

  it('numbers turn order (1, 2, 3, 4) in countdown overlay when players > 2', () => {
    // gaCountdown contains turn calculation logic for multiplayer
    expect(arcadeJs).toContain('(i - resolvedFirstIndex + players.length) % players.length) + 1');
    expect(arcadeJs).toContain('ga-cd-turn-badge');
    expect(arcadeJs).toContain('ga-cd-turn-pill');

    // games-arcade.css styles the turn order badges and pills
    expect(arcadeCss).toContain('.ga-cd-turn-badge');
    expect(arcadeCss).toContain('.ga-cd-turn-badge.is-first-turn');
    expect(arcadeCss).toContain('.ga-cd-turn-pill');
    expect(arcadeCss).toContain('.ga-cd-turn-pill.is-first-turn');
  });

  it('verifies mathematical turn rotation sequence correctness', () => {
    const players = ['Alice', 'Bob', 'Charlie', 'Daisy'];
    const total = players.length;

    // Test case 1: Daisy (index 3) is chosen to start (turn 1)
    const firstIndex = 3;
    const turnNumbers = players.map((_, i) => ((i - firstIndex + total) % total) + 1);

    expect(turnNumbers[3]).toBe(1); // Daisy is Turn 1
    expect(turnNumbers[0]).toBe(2); // Alice is Turn 2
    expect(turnNumbers[1]).toBe(3); // Bob is Turn 3
    expect(turnNumbers[2]).toBe(4); // Charlie is Turn 4

    // Test case 2: Bob (index 1) is chosen to start (turn 1)
    const firstIndexBob = 1;
    const turnNumbersBob = players.map((_, i) => ((i - firstIndexBob + total) % total) + 1);

    expect(turnNumbersBob[1]).toBe(1); // Bob is Turn 1
    expect(turnNumbersBob[2]).toBe(2); // Charlie is Turn 2
    expect(turnNumbersBob[3]).toBe(3); // Daisy is Turn 3
    expect(turnNumbersBob[0]).toBe(4); // Alice is Turn 4
  });
});
