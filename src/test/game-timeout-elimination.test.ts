import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const html = readFileSync('public/pokeayman/index.html', 'utf8');

describe('Game Timeout Elimination & 2-Player Immediate Loss Logic', () => {
  let app: any;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-root"></div>';
    app = window as any;

    app.activeGamePlayers = [
      { student_name: 'Ash Ketchum', avatar_pokemon_id: 25 },
      { student_name: 'Gary Oak', avatar_pokemon_id: 133 }
    ];
    app.activeGameScores = [10, 0];
    app.activeGamePlayerIndex = 0;
    app.activeGamePlayerRemaining = [0, 60];
    app.activeGamePlayerEliminated = [false, false];
    app.activeGameReward = 0;
    app.activeGameRewardClaimed = false;
    app.currentRole = 'teacher';
    app.gameStudentAvatarMarkup = () => '<span>avatar</span>';
    app.stopGameFinishedActivity = vi.fn();
    app.playScoreDeltaSound = vi.fn();
    app.toast = vi.fn();
    app.showGameCelebration = vi.fn();
    app.getAllStudents = () => [];
    app.mountGameCelebrationOverlay = (modal: HTMLElement, overlay: HTMLElement) => modal.appendChild(overlay);
  });

  it('contains 2-player immediate loss on timeout in index.html and Dots and Boxes', () => {
    expect(html).toContain('if (activeGamePlayers.length === 2)');
    expect(html).toContain('activeGamePlayerEliminated[activeIndex] = true');
    expect(html).toContain('${loserName} ran out of time! ${winnerName} wins!');
    expect(html).toContain('handleMatchTimeout');
  });

  it('contains 3+ player elimination and last player standing in index.html', () => {
    expect(html).toContain('activeGamePlayerEliminated[activeIndex] = true');
    expect(html).toContain('is eliminated!');
    expect(html).toContain('last player standing and wins!');
    expect(html).toContain('advanceGameTurn');
  });

  it('skips eliminated players when advancing game turns', () => {
    // Extract advanceGameTurn from index.html
    const advStart = 'function advanceGameTurn() {';
    const advEnd = 'function renderGamePlayerHud(';
    const startIdx = html.indexOf(advStart);
    const endIdx = html.indexOf(advEnd);
    expect(startIdx).toBeGreaterThan(-1);
    expect(endIdx).toBeGreaterThan(startIdx);

    const advanceFnSrc = html.slice(startIdx, endIdx);
    const sandbox = new Function('window', `${advanceFnSrc}; window.advanceGameTurn = advanceGameTurn;`);
    sandbox(app);

    app.activeGamePlayers = [
      { student_name: 'Player 1' },
      { student_name: 'Player 2' },
      { student_name: 'Player 3' }
    ];
    app.activeGamePlayerEliminated = [false, true, false]; // Player 2 is eliminated
    app.activeGamePlayerIndex = 0;

    // Advance from 0 -> should skip 1 (eliminated) and land on 2
    app.advanceGameTurn();
    expect(app.activeGamePlayerIndex).toBe(2);

    // Advance from 2 -> should wrap around to 0
    app.advanceGameTurn();
    expect(app.activeGamePlayerIndex).toBe(0);
  });

  it('excludes eliminated players from winning in showGameCelebration', () => {
    const celebStart = 'function showGameCelebration(';
    const celebEnd = 'function showBattleWinnerCelebration(';
    const startIdx = html.indexOf(celebStart);
    const endIdx = html.indexOf(celebEnd);
    expect(startIdx).toBeGreaterThan(-1);
    expect(endIdx).toBeGreaterThan(startIdx);

    const celebSrc = html.slice(startIdx, endIdx);
    const sandbox = new Function('window', 'document', 'mountGameCelebrationOverlay', `${celebSrc}; window.showGameCelebration = showGameCelebration;`);
    sandbox(app, document, app.mountGameCelebrationOverlay);

    const mockModal = document.createElement('div');
    document.body.appendChild(mockModal);

    app.activeGamePlayers = [
      { student_name: 'Eliminated Leader', avatar_pokemon_id: 1 },
      { student_name: 'Active Runner Up', avatar_pokemon_id: 4 }
    ];
    // Eliminated Leader has 15 points, Active Runner Up has 5 points
    app.activeGameScores = [15, 5];
    app.activeGamePlayerEliminated = [true, false];

    app.showGameCelebration(mockModal);

    const titleEl = mockModal.querySelector('#celebration-title');
    expect(titleEl?.textContent).toContain('Active Runner Up wins!');
    expect(titleEl?.textContent).not.toContain('Eliminated Leader');
  });
});
