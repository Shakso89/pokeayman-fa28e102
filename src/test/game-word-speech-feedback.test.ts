import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Game Vocabulary Speech Feedback', () => {
  const root = path.resolve(__dirname, '../..');
  const gamesDir = path.join(root, 'public', 'pokeayman');

  it('defines window.readGameWordAloud in games-arcade.js and index.html', () => {
    const arcade = fs.readFileSync(path.join(gamesDir, 'games-arcade.js'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(gamesDir, 'index.html'), 'utf8');

    expect(arcade).toContain('window.readGameWordAloud = function');
    expect(indexHtml).toContain('window.readGameWordAloud = function');
  });

  describe('Correct answer word pronunciation (all games)', () => {
    it('Dots and Boxes reads word on correct answer', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'dots-and-boxes.js'), 'utf8');
      expect(code).toMatch(/if\s*\(selected\s*===\s*currentQuestion\.correctAnswer\)\s*\{[\s\S]*?readGameWordAloud\s*\(\s*currentQuestion\.correctAnswer\s*\)/);
    });

    it('Match Words reads word on correct match', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'match-words.js'), 'utf8');
      expect(code).toContain('readGameWordAloud(target.vocab_word)');
    });

    it('Unscramble reads word on correct answer', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'unscramble.js'), 'utf8');
      expect(code).toMatch(/playScrambleSound\('correct'\);[\s\S]*?readGameWordAloud\(/);
    });

    it('Surprise Boxes reads word on correct answer', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'surprise-boxes.js'), 'utf8');
      expect(code).toMatch(/if\s*\(isCorrect\)\s*\{[\s\S]*?readGameWordAloud\(targetWord\)/);
    });

    it('Find Me reads word on correct answer', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'find-me.js'), 'utf8');
      expect(code).toMatch(/if\s*\(correct\)\s*\{[\s\S]*?readGameWordAloud\(target\.vocab_word\)/);
    });

    it('Crossword reads word when clue is solved', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'crossword.js'), 'utf8');
      expect(code).toMatch(/window\.pokeSfx\?\.play\?\.?\('correct'\);[\s\S]*?readGameWordAloud\(/);
    });

    it('Hangman reads word when secret word is completed', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'hangman.js'), 'utf8');
      expect(code).toMatch(/if\s*\(word\.split\(''\)\.every[\s\S]*?readGameWordAloud\(/);
    });

    it('Memory Flip reads word when vocabulary pair is matched', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'memory-flip.js'), 'utf8');
      expect(code).toMatch(/Standard vocab match[\s\S]*?readGameWordAloud\(/);
      expect(code).toContain('readGameWordAloud(magnetWord)');
    });

    it('Listen & Catch reads word on correct answer', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'listen-catch.js'), 'utf8');
      expect(code).toContain('readGameWordAloud(correct.vocab_word)');
    });

    it('Vocab Battle reads word on correct answer', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'vocab-battle.js'), 'utf8');
      expect(code).toContain('readGameWordAloud(battle.currentWord)');
    });
  });

  describe('Wrong answer speech restrictions (only 5 games)', () => {
    it('reads correct word on wrong answer for Dots and Boxes after wrong sound', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'dots-and-boxes.js'), 'utf8');
      const wrongBlock = code.match(/window\.pokeSfx\?\.play\?\.?\('wrong'\);[\s\S]*?readGameWordAloud\s*\(\s*currentQuestion\.correctAnswer,\s*350\s*\)/);
      expect(wrongBlock).not.toBeNull();
    });

    it('reads correct word on wrong answer for Match Words after wrong sound', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'match-words.js'), 'utf8');
      const wrongBlock = code.match(/playGameSound\('wrong'\);[\s\S]*?readGameWordAloud\s*\(\s*target\.vocab_word,\s*350\s*\)/);
      expect(wrongBlock).not.toBeNull();
    });

    it('reads correct word on wrong answer for Unscramble after wrong sound', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'unscramble.js'), 'utf8');
      const wrongBlock = code.match(/playGameSound\('wrong'\);[\s\S]*?readGameWordAloud\s*\([\s\S]*?,\s*350\s*\)/);
      expect(wrongBlock).not.toBeNull();
    });

    it('reads correct word on wrong answer for Surprise Boxes after wrong sound', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'surprise-boxes.js'), 'utf8');
      const wrongBlock = code.match(/try\s*\{\s*window\.pokeSfx\?\.play\('wrong'\);\s*\}\s*catch[\s\S]*?readGameWordAloud\s*\(\s*targetWord,\s*350\s*\)/);
      expect(wrongBlock).not.toBeNull();
    });

    it('reads correct word on wrong answer for Find Me after wrong sound', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'find-me.js'), 'utf8');
      const wrongBlock = code.match(/try\s*\{\s*window\.pokeSfx\?\.play\?\.?\('wrong'\);\s*\}\s*catch[\s\S]*?readGameWordAloud\s*\(\s*target\.vocab_word,\s*350\s*\)/);
      expect(wrongBlock).not.toBeNull();
    });

    it('does NOT read word on wrong answer for other games (Crossword, Hangman, Memory Flip, Listen & Catch)', () => {
      const crossword = fs.readFileSync(path.join(gamesDir, 'crossword.js'), 'utf8');
      const hangman = fs.readFileSync(path.join(gamesDir, 'hangman.js'), 'utf8');
      const memory = fs.readFileSync(path.join(gamesDir, 'memory-flip.js'), 'utf8');
      const listen = fs.readFileSync(path.join(gamesDir, 'listen-catch.js'), 'utf8');

      // Crossword wrong branch: only plays sound
      expect(crossword).not.toMatch(/window\.pokeSfx\?\.play\?\.?\('wrong'\);[\s\S]{1,120}readGameWordAloud/);

      // Hangman wrong guess branch: only plays sound
      expect(hangman).not.toMatch(/window\.pokeSfx\?\.play\?\.?\('wrong'\);[\s\S]{1,120}readGameWordAloud/);

      // Memory flip wrong match branch: only plays sound
      expect(memory).not.toMatch(/playGameSound\('wrong'\);[\s\S]{1,120}readGameWordAloud/);

      // Listen & catch wrong branch: only plays sound
      expect(listen).not.toMatch(/window\.pokeSfx\?\.play\?\.?\('wrong'\);[\s\S]{1,120}readGameWordAloud/);
    });
  });
});
