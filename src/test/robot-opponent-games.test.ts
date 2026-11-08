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

  it('renders Robot difficulty picker with Easy, Medium, and Hard in gaStudentSetup', () => {
    expect(arcadeJs).toContain('ga-bot-difficulty-picker');
    expect(arcadeJs).toContain("id: 'easy', label: 'Easy'");
    expect(arcadeJs).toContain("id: 'medium', label: 'Medium'");
    expect(arcadeJs).toContain("id: 'hard', label: 'Hard'");
    expect(arcadeJs).toContain('Opponent: Robot');
    expect(arcadeJs).toContain('window.selectedBotDifficulty');
  });

  it('initializes activeGamePlayers with student and Robot opponent in chooseGamePlayers for students', () => {
    expect(html).toContain("const robotPlayer = (window.createRobotPlayer || createRobotPlayer)(window.selectedBotDifficulty || 'medium');");
    expect(html).toContain('activeGamePlayers = [signedInStudent, robotPlayer];');
    expect(html).toContain('pendingGamePlayers = 2;');
  });

  it('renders a distinct robot badge for robot players in gameStudentAvatarMarkup', () => {
    expect(html).toContain("student?.isBot || student?.student_name === 'Robot' || student?.__backendId === 'bot-robot'");
    expect(html).toContain('🤖');
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
});
