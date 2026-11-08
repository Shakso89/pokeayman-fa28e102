import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Robot Opponent & Difficulty Selection for All Student Games', () => {
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const arcadePath = path.resolve(__dirname, '../../public/pokeayman/games-arcade.js');
  const arcadeJs = fs.readFileSync(arcadePath, 'utf8');
  const dotsPath = path.resolve(__dirname, '../../public/pokeayman/dots-and-boxes.js');
  const dotsJs = fs.readFileSync(dotsPath, 'utf8');
  const baamPath = path.resolve(__dirname, '../../public/pokeayman/surprise-boxes.js');
  const baamJs = fs.readFileSync(baamPath, 'utf8');
  const memoryPath = path.resolve(__dirname, '../../public/pokeayman/memory-flip.js');
  const memoryJs = fs.readFileSync(memoryPath, 'utf8');
  const matchPath = path.resolve(__dirname, '../../public/pokeayman/match-words.js');
  const matchJs = fs.readFileSync(matchPath, 'utf8');
  const hangmanPath = path.resolve(__dirname, '../../public/pokeayman/hangman.js');
  const hangmanJs = fs.readFileSync(hangmanPath, 'utf8');
  const crosswordPath = path.resolve(__dirname, '../../public/pokeayman/crossword.js');
  const crosswordJs = fs.readFileSync(crosswordPath, 'utf8');
  const findMePath = path.resolve(__dirname, '../../public/pokeayman/find-me.js');
  const findMeJs = fs.readFileSync(findMePath, 'utf8');
  const unscramblePath = path.resolve(__dirname, '../../public/pokeayman/unscramble.js');
  const unscrambleJs = fs.readFileSync(unscramblePath, 'utf8');

  it('exposes createRobotPlayer on window returning a bot named Robot with difficulty', () => {
    expect(arcadeJs).toContain('window.createRobotPlayer');
    expect(arcadeJs).toContain("student_name: 'Robot'");
    expect(arcadeJs).toContain('isBot: true');
    expect(arcadeJs).toContain("botDifficulty: diff");
    expect(arcadeJs).toContain("['easy', 'medium', 'hard']");
  });

  it('renders futuristic Robot difficulty picker with Easy, Normal, and Hard for both teacher and student dashboards without emojis', () => {
    expect(arcadeJs).toContain('ga-bot-difficulty-picker');
    expect(arcadeJs).toContain("id: 'easy', label: 'Easy'");
    expect(arcadeJs).toContain("id: 'normal', label: 'Normal'");
    expect(arcadeJs).toContain("id: 'hard', label: 'Hard'");
    expect(arcadeJs).toContain('OPPONENT: ROBOT');
    expect(arcadeJs).toContain('window.selectedBotDifficulty');
    expect(arcadeJs).toContain('ga-speedometer-needle');
    expect(arcadeJs).toContain('ga-gauge-sector');
    expect(arcadeJs).not.toContain("icon: '🌱'");
    expect(arcadeJs).not.toContain("icon: '⚡'");
    expect(arcadeJs).not.toContain("icon: '🔥'");
  });

  it('initializes activeGamePlayers with student and Robot opponent in chooseGamePlayers for students', () => {
    expect(html).toContain("const robotPlayer = (window.createRobotPlayer || createRobotPlayer)(window.selectedBotDifficulty || 'normal');");
    expect(html).toContain('activeGamePlayers = [signedInStudent, robotPlayer];');
    expect(html).toContain('pendingGamePlayers = 2;');
  });

  it('renders a distinct robot badge for robot players in gameStudentAvatarMarkup using SVG without emojis', () => {
    expect(html).toContain("student?.isBot || student?.student_name === 'Robot' || student?.__backendId === 'bot-robot'");
    expect(html).toContain('aria-label="Robot opponent"');
  });

  it('integrates Robot bot turn logic across all 8 student games', () => {
    // 1. Dots and Boxes
    expect(dotsJs).toContain("student_name: 'Robot'");
    expect(dotsJs).toContain('checkBotTurn');

    // 2. Surprise Boxes
    expect(baamJs).toContain("student_name: 'Robot'");
    expect(baamJs).toContain('checkBaamBotTurn');

    // 3. Memory Flip
    expect(memoryJs).toContain("student_name: 'Robot'");
    expect(memoryJs).toContain('checkMemoryBotTurn');

    // 4. Match Words
    expect(matchJs).toContain("student_name: 'Robot'");
    expect(matchJs).toContain('checkMatchBotTurn');

    // 5. Hangman
    expect(hangmanJs).toContain("student_name: 'Robot'");
    expect(hangmanJs).toContain('checkHangmanBotTurn');

    // 6. Crosswords
    expect(crosswordJs).toContain("student_name: 'Robot'");
    expect(crosswordJs).toContain('checkCrosswordBotTurn');

    // 7. Find Me
    expect(findMeJs).toContain("student_name: 'Robot'");
    expect(findMeJs).toContain('checkFindMeBotTurn');

    // 8. Unscramble
    expect(unscrambleJs).toContain("student_name: 'Robot'");
    expect(unscrambleJs).toContain('checkScrambleBotTurn');
  });

  it('supports Robot opponent on teacher dashboard setup lobby with difficulty selection', () => {
    // Teacher lobby has vs Robot toggle
    expect(arcadeJs).toContain('ga-pick-robot-btn');
    expect(arcadeJs).toContain('vs Robot');
    expect(arcadeJs).toContain('window.teacherRobotOpponent');
    expect(arcadeJs).toContain('ga-teacher-bot-difficulty');

    // Stepper styling prevents line breaking and container overflow
    expect(arcadeJs).toContain('ga-stepper-val min-w-[96px] whitespace-nowrap');
    expect(arcadeJs).toContain("label: '5×5 dots · 16 boxes'");

    // Teacher launch supports 1 student + Robot
    expect(html).toContain('const isRobotOpponent = Boolean(window.teacherRobotOpponent);');
    expect(html).toContain('if (isRobotOpponent && selected.length === 1)');
    expect(html).toContain('Dots and Boxes requires 2 students or 1 student vs Robot to play');
  });

  it('provides generous top padding for vocabulary lists to eliminate text clipping', () => {
    expect(html).toContain('padding: .75rem .5rem .75rem .5rem;');
    expect(html).toContain("listArea.className = 'ga-vocab-scroll-area max-h-[58vh] overflow-y-auto px-1 pt-3 pb-2';");
    expect(html).toContain('<div class="space-y-6 student-games-multi-class mb-4 pt-2">');
  });

  it('triggers checkMemoryBotTurn upon match in Memory Flip so Robot continues playing its turn', () => {
    expect(memoryJs).toMatch(/syncCardFaces\(\);\s*if\s*\(matched\.size\s*<\s*pairs\.length\)\s*\{\s*checkMemoryBotTurn\(\);/);
  });

  it('prevents human players from clicking cards or tiles during Robot turns', () => {
    expect(memoryJs).toContain('if (curPlayer?.isBot && e.isTrusted) return;');
    expect(baamJs).toContain('if (curPlayer?.isBot && e.isTrusted) return;');
    expect(dotsJs).toContain('if (curPlayer?.isBot && e.isTrusted) return;');
    expect(matchJs).toContain('if (curPlayer?.isBot && e.isTrusted) return;');
  });

  it('gives ample time on Surprise Boxes bot turns for students to inspect powerups and score changes', () => {
    // 3200ms powerup dismissal timeout
    expect(baamJs).toContain('3200');
    // Generous feedback inspection on bot choice answers
    expect(baamJs).toContain('isBotAnswering ? 1800 : 850');
  });

  it('equips Dots and Boxes bot with smart 2-turn combo strategy to close 2-sided / 90-degree boxes', () => {
    expect(dotsJs).toContain('consecutiveTurnsRemaining > 1');
    expect(dotsJs).toContain('state.drawnCount === 2');
    expect(dotsJs).toContain('twoSidedBoxes');
  });
});
