import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const html = readFileSync('public/pokeayman/index.html', 'utf8');
const hangmanJs = readFileSync('public/pokeayman/hangman.js', 'utf8');
const dotsJs = readFileSync('public/pokeayman/dots-and-boxes.js', 'utf8');

describe('Game Timeout Elimination & Score Determination Rules', () => {
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

  it('marks player eliminated and skips them for rest of the game when time runs out', () => {
    expect(html).toContain('activeGamePlayerEliminated[activeIndex] = true');
    expect(html).toContain('ran out of time and is skipped for the rest of the game!');
    expect(html).toContain('advanceGameTurn()');
  });

  it('decides winner by score when all players run out of time for non-hangman games', () => {
    expect(html).toContain('remainingIndices.length === 0');
    expect(html).toContain('All players ran out of time! Final score decides the winner!');
    expect(html).toContain("showGameCelebration(modal, 'Time is up!', 'Final score decided by points')");
  });

  it('declares Even even seven eleven when both students run out of time in Hangman and word is unsolved', () => {
    expect(html).toContain('isHangman');
    expect(html).toContain('Word was not solved — Even even seven eleven!');
    expect(html).toContain("showGameCelebration(modal, 'Time is up! The word was not solved.', currentWord, null, '', true)");
  });

  it('does not deduct points on wrong guesses in Hangman', () => {
    // Hangman wrong guess must not decrement activeGameScores
    expect(hangmanJs).not.toContain('activeGameScores[activeGamePlayerIndex] -= 1');
    expect(html).not.toContain('activeGameScores[activeGamePlayerIndex] -= 1');
  });

  it('skips timed-out player in Dots and Boxes and decides winner by score if both run out of time', () => {
    expect(dotsJs).toContain('ran out of time and will be skipped!');
    expect(dotsJs).toContain('Even even seven eleven');
    expect(dotsJs).toContain('handleMatchTimeout');
  });

  it('skips eliminated players when advancing game turns', () => {
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

  it('forces Even even seven eleven in showGameCelebration when forceTie is true', () => {
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
      { student_name: 'Student A', avatar_pokemon_id: 1 },
      { student_name: 'Student B', avatar_pokemon_id: 4 }
    ];
    // Student A has 3 points and Student B has 1 point, but timeout with unsolved word triggers forceTie
    app.activeGameScores = [3, 1];
    app.activeGamePlayerEliminated = [true, true];

    app.showGameCelebration(mockModal, 'Time is up! The word was not solved.', 'PIKACHU', null, '', true);

    const titleEl = mockModal.querySelector('#celebration-title');
    expect(titleEl?.textContent).toBe('Even even seven eleven');
  });

  it('awards win to highest score when all players run out of time in non-hangman games', () => {
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
      { student_name: 'High Scorer', avatar_pokemon_id: 1 },
      { student_name: 'Low Scorer', avatar_pokemon_id: 4 }
    ];
    // Both timed out, but High Scorer has 8 points and Low Scorer has 3
    app.activeGameScores = [8, 3];
    app.activeGamePlayerEliminated = [true, true];

    app.showGameCelebration(mockModal, 'Time is up!', 'Final score decided by points');

    const titleEl = mockModal.querySelector('#celebration-title');
    expect(titleEl?.textContent).toContain('🎉 High Scorer wins!');
  });
});
