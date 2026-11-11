import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const html = readFileSync('public/pokeayman/index.html', 'utf8');
const crosswordSrc = readFileSync('public/pokeayman/crossword.js', 'utf8');

describe('Crossword Winner Determined by Highest Points', () => {
  let app: any;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-root"></div>';
    app = window as any;

    app.activeGamePlayers = [
      { student_name: 'Player One', avatar_pokemon_id: 25 },
      { student_name: 'Player Two', avatar_pokemon_id: 133 }
    ];
    app.activeGameScores = [0, 0];
    app.activeGamePlayerIndex = 0;
    app.activeGamePlayerRemaining = [60, 60];
    app.activeGamePlayerEliminated = [false, false];
    app.activeGameReward = 0;
    app.activeGameRewardClaimed = false;
    app.currentRole = 'teacher';
    app.gameStudentAvatarMarkup = () => '<span>avatar</span>';
    app.stopGameFinishedActivity = vi.fn();
    app.playScoreDeltaSound = vi.fn();
    app.toast = vi.fn();
    app.getAllStudents = () => [];
    app.mountGameCelebrationOverlay = (modal: HTMLElement, overlay: HTMLElement) => modal.appendChild(overlay);
    app.pkRecordWin = vi.fn();

    // Extract showGameCelebration from index.html
    const celebStart = 'function showGameCelebration(';
    const celebEnd = 'function showBattleWinnerCelebration(';
    const startIdx = html.indexOf(celebStart);
    const endIdx = html.indexOf(celebEnd);
    const celebSrc = html.slice(startIdx, endIdx);
    const sandbox = new Function('window', 'document', 'mountGameCelebrationOverlay', `${celebSrc}; window.showGameCelebration = showGameCelebration;`);
    sandbox(app, document, app.mountGameCelebrationOverlay);
  });

  it('ensures crossword.js does not pass activeGamePlayers[activeGamePlayerIndex] as winnerOverride', () => {
    expect(crosswordSrc).not.toContain("showGameCelebration(modal, 'Crossword solved!', '', activeGamePlayers[activeGamePlayerIndex])");
    expect(crosswordSrc).toContain('showGameCelebration(modal, `Crossword solved!${scoreSummary}`)');
  });

  it('awards victory to Player One when Player One has more points even if Player Two solves the last word', () => {
    const modal = document.createElement('div');
    document.body.appendChild(modal);

    // Player One has 3 points, Player Two has 1 point
    app.activeGameScores = [3, 1];
    // Player Two solved the last word
    app.activeGamePlayerIndex = 1;

    const scoreSummary = ` (${app.activeGamePlayers.map((p: any, i: number) => `${p.student_name}: ${app.activeGameScores[i]}`).join(' · ')})`;
    app.showGameCelebration(modal, `Crossword solved!${scoreSummary}`);

    const titleEl = modal.querySelector('#celebration-title');
    expect(titleEl?.textContent).toContain('Player One wins!');
    expect(titleEl?.textContent).not.toContain('Player Two wins!');

    const messageEl = modal.querySelector('p.font-semibold');
    expect(messageEl?.textContent).toContain('Crossword solved! (Player One: 3 · Player Two: 1)');

    expect(app.pkRecordWin).toHaveBeenCalledWith('Player One', 'game_wins');
  });

  it('declares a tie when scores are equal even if Player Two solves the last word', () => {
    const modal = document.createElement('div');
    document.body.appendChild(modal);

    // Both players have 2 points
    app.activeGameScores = [2, 2];
    // Player Two solved the last word
    app.activeGamePlayerIndex = 1;

    const scoreSummary = ` (${app.activeGamePlayers.map((p: any, i: number) => `${p.student_name}: ${app.activeGameScores[i]}`).join(' · ')})`;
    app.showGameCelebration(modal, `Crossword solved!${scoreSummary}`);

    const titleEl = modal.querySelector('#celebration-title');
    expect(titleEl?.textContent).toBe('Even even seven eleven');
    expect(titleEl?.textContent).not.toContain('wins!');

    const messageEl = modal.querySelector('p.font-semibold');
    expect(messageEl?.textContent).toContain('Crossword solved! (Player One: 2 · Player Two: 2)');

    expect(app.pkRecordWin).not.toHaveBeenCalled();
  });

  it('awards victory to Player Two when Player Two has highest points and solves the last word', () => {
    const modal = document.createElement('div');
    document.body.appendChild(modal);

    // Player One has 1 point, Player Two has 4 points
    app.activeGameScores = [1, 4];
    app.activeGamePlayerIndex = 1;

    const scoreSummary = ` (${app.activeGamePlayers.map((p: any, i: number) => `${p.student_name}: ${app.activeGameScores[i]}`).join(' · ')})`;
    app.showGameCelebration(modal, `Crossword solved!${scoreSummary}`);

    const titleEl = modal.querySelector('#celebration-title');
    expect(titleEl?.textContent).toContain('Player Two wins!');
    expect(app.pkRecordWin).toHaveBeenCalledWith('Player Two', 'game_wins');
  });
});
