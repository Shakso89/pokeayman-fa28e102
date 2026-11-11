import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Game Bot Speech Delay & Synchronization', () => {
  const root = path.resolve(__dirname, '../..');
  const gamesDir = path.join(root, 'public', 'pokeayman');

  it('defines waitForGameWordAloud and isGameWordReadingAloud in games-arcade.js and index.html', () => {
    const arcade = fs.readFileSync(path.join(gamesDir, 'games-arcade.js'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(gamesDir, 'index.html'), 'utf8');

    expect(arcade).toContain('window.waitForGameWordAloud = function');
    expect(arcade).toContain('window.isGameWordReadingAloud = function');
    expect(arcade).toContain('window.clearWaitForGameWordAloud = function');

    expect(indexHtml).toContain('window.waitForGameWordAloud = function');
    expect(indexHtml).toContain('window.isGameWordReadingAloud = function');
    expect(indexHtml).toContain('window.clearWaitForGameWordAloud = function');
  });

  describe('Dots and Boxes bot turn waits for speech', () => {
    it('uses waitForGameWordAloud in MCQ and DRAW_LINE phases', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'dots-and-boxes.js'), 'utf8');
      expect(code).toContain('window.waitForGameWordAloud');
      expect(code).toMatch(/if\s*\(phase\s*===\s*'MCQ'\)\s*\{[\s\S]*?botTurnTimer\s*=\s*scheduleFn/);
      expect(code).toMatch(/else\s*if\s*\(phase\s*===\s*'DRAW_LINE'\)\s*\{[\s\S]*?botTurnTimer\s*=\s*scheduleFn/);
    });

    it('clears bot turn with clearWaitForGameWordAloud', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'dots-and-boxes.js'), 'utf8');
      expect(code).toContain('window.clearWaitForGameWordAloud(botTurnTimer)');
    });
  });

  describe('All other robot opponent games use waitForGameWordAloud', () => {
    it('Match Words bot turn waits for speech', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'match-words.js'), 'utf8');
      expect(code).toContain('window.waitForGameWordAloud');
      expect(code).toContain('window.clearWaitForGameWordAloud(matchBotTimer)');
      expect(code).toMatch(/matchBotTimer\s*=\s*scheduleFn\(/);
    });

    it('Unscramble bot turn waits for speech', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'unscramble.js'), 'utf8');
      expect(code).toContain('window.waitForGameWordAloud');
      expect(code).toContain('window.clearWaitForGameWordAloud(scrambleBotTimer)');
      expect(code).toMatch(/scrambleBotTimer\s*=\s*scheduleFn\(/);
    });

    it('Surprise Boxes bot turn waits for speech', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'surprise-boxes.js'), 'utf8');
      expect(code).toContain('window.waitForGameWordAloud');
      expect(code).toContain('window.clearWaitForGameWordAloud(baamBotTimer)');
      expect(code).toMatch(/baamBotTimer\s*=\s*scheduleFn\(/);
    });

    it('Find Me bot turn waits for speech', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'find-me.js'), 'utf8');
      expect(code).toContain('window.waitForGameWordAloud');
      expect(code).toContain('window.clearWaitForGameWordAloud(findMeBotTimer)');
      expect(code).toMatch(/findMeBotTimer\s*=\s*scheduleFn\(/);
    });

    it('Crosswords bot turn waits for speech', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'crossword.js'), 'utf8');
      expect(code).toContain('window.waitForGameWordAloud');
      expect(code).toContain('window.clearWaitForGameWordAloud(cwBotTimer)');
      expect(code).toMatch(/cwBotTimer\s*=\s*scheduleFn\(/);
    });

    it('Hangman bot turn waits for speech', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'hangman.js'), 'utf8');
      expect(code).toContain('window.waitForGameWordAloud');
      expect(code).toContain('window.clearWaitForGameWordAloud(hangmanBotTimer)');
      expect(code).toMatch(/hangmanBotTimer\s*=\s*scheduleFn\(/);
    });

    it('Memory Flip bot turn waits for speech', () => {
      const code = fs.readFileSync(path.join(gamesDir, 'memory-flip.js'), 'utf8');
      expect(code).toContain('window.waitForGameWordAloud');
      expect(code).toContain('window.clearWaitForGameWordAloud(memoryBotTimer)');
      expect(code).toMatch(/memoryBotTimer\s*=\s*scheduleFn\(/);
    });
  });
});
