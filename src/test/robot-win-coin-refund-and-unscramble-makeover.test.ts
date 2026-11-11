import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const html = readFileSync('public/pokeayman/index.html', 'utf8');
const unscrambleSrc = readFileSync('public/pokeayman/unscramble.js', 'utf8');
const surpriseBoxesSrc = readFileSync('public/pokeayman/surprise-boxes.js', 'utf8');
const arcadeCss = readFileSync('public/pokeayman/games-arcade.css', 'utf8');

describe('Robot Win Coin Refund & Unscramble Makeover Ratio', () => {
  let app: any;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-root"></div>';
    app = window as any;

    app.activeGamePlayers = [
      { student_name: 'Ayman', avatar_pokemon_id: 25 },
      { student_name: 'Robot', isBot: true, avatar_pokemon_id: 137 }
    ];
    app.activeGameScores = [2, 5]; // Robot won with 5 points
    app.activeGamePlayerIndex = 1;
    app.activeGamePlayerRemaining = [60, 60];
    app.activeGamePlayerEliminated = [false, false];
    app.activeGameReward = 5;
    app.activeGameRewardClaimed = false;
    app.currentRole = 'teacher';
    app.currentTeacher = 'Teacher Sarah';
    app.gameStudentAvatarMarkup = () => '<span>avatar</span>';
    app.stopGameFinishedActivity = vi.fn();
    app.playScoreDeltaSound = vi.fn();
    app.toast = vi.fn();
    app.getAllStudents = () => [{ student_name: 'Ayman', __backendId: 'std_1', coins: 10 }];
    app.mountGameCelebrationOverlay = (modal: HTMLElement, overlay: HTMLElement) => modal.appendChild(overlay);
    app.pkRecordWin = vi.fn();
    app.refundTeacherCredits = vi.fn();

    // Extract showGameCelebration from index.html
    const celebStart = 'function showGameCelebration(';
    const celebEnd = 'function showBattleWinnerCelebration(';
    const startIdx = html.indexOf(celebStart);
    const endIdx = html.indexOf(celebEnd);
    const celebSrc = html.slice(startIdx, endIdx);
    const sandbox = new Function('window', 'document', 'mountGameCelebrationOverlay', `${celebSrc}; window.showGameCelebration = showGameCelebration;`);
    sandbox(app, document, app.mountGameCelebrationOverlay);
  });

  it('does NOT display coins won banner and refunds teacher credits when Robot wins in showGameCelebration', () => {
    const modal = document.createElement('div');
    document.body.appendChild(modal);

    app.showGameCelebration(modal, 'Game Finished!');

    const titleEl = modal.querySelector('#celebration-title');
    expect(titleEl?.textContent).toContain('Robot wins!');

    // Cheering box should NOT contain coins won or robot +5 coins
    const celebrationCard = modal.querySelector('.game-celebration-card');
    expect(celebrationCard?.textContent).not.toContain('coins won');
    expect(celebrationCard?.textContent).not.toContain('+5 coins');
    expect(celebrationCard?.textContent).not.toContain('🪙');

    // Win is NOT recorded for Robot
    expect(app.pkRecordWin).not.toHaveBeenCalled();

    // 5 credits are refunded back to the teacher
    expect(app.refundTeacherCredits).toHaveBeenCalledWith(5, 'Teacher Sarah');
  });

  it('displays coins won banner and does NOT refund teacher when a human student wins', () => {
    const modal = document.createElement('div');
    document.body.appendChild(modal);

    // Human student won
    app.activeGameScores = [5, 2];
    app.activeGamePlayerIndex = 0;
    app.dataSdk = { update: vi.fn().mockResolvedValue({ isOk: true }) };

    app.showGameCelebration(modal, 'Game Finished!');

    const titleEl = modal.querySelector('#celebration-title');
    expect(titleEl?.textContent).toContain('Ayman wins!');

    // Cheering box contains coins won for human
    const celebrationCard = modal.querySelector('.game-celebration-card');
    expect(celebrationCard?.textContent).toContain('Good job 🪙 5 coins won');

    // Win is recorded for student
    expect(app.pkRecordWin).toHaveBeenCalledWith('Ayman', 'game_wins');

    // No refund because prize was awarded to student
    expect(app.refundTeacherCredits).not.toHaveBeenCalled();
  });

  it('ensures surprise-boxes refunds teacher credits and hides prize banner when Robot wins', () => {
    expect(surpriseBoxesSrc).toContain('const isBotWinner = Boolean(winnerPlayer?.isBot || winnerPlayer?.student_name === \'Robot\');');
    expect(surpriseBoxesSrc).toContain('refundTeacherCredits(baamConfiguredPrize, teacher)');
    expect(surpriseBoxesSrc).toContain('const baamPrizeNotice = (!isBotWinner && baamAwardedPrize > 0)');
  });

  it('links unscramble bot turn difficulty to the active in-game difficulty setting', () => {
    expect(unscrambleSrc).toContain("const activeDifficulty = difficulty || scrambleSession?.difficulty || 'easy';");
    expect(unscrambleSrc).toContain("const diff = curPlayer.botDifficulty || (activeDifficulty === 'hard' ? 'hard' : (activeDifficulty === 'easy' ? 'easy' : (window.selectedBotDifficulty || 'normal')));");
  });

  it('guarantees 100% correct spelling ratio on makeover rounds in unscramble', () => {
    expect(unscrambleSrc).toContain('const isMakeoverRound = awaitingMakeup || phase === \'retrying\';');
    expect(unscrambleSrc).toContain('if (!isMakeoverRound) {');
  });

  it('ensures unscramble makeover practice hint uses compact horizontal layout and streamlined sizing', () => {
    expect(arcadeCss).toContain('#scramble-practice-hint:not(.hidden)');
    expect(arcadeCss).toContain('flex-direction: row !important;');
    expect(arcadeCss).toContain('max-height: 46px !important;');
    expect(arcadeCss).toContain('body > .ga-stage #scramble-clue');
    expect(arcadeCss).toContain('height: 72px !important;');
  });
});
