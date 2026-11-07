import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Unscramble Game Module Launch & Session State', () => {
  const unscramblePath = path.resolve(__dirname, '../../public/pokeayman/unscramble.js');
  const unscrambleJs = fs.readFileSync(unscramblePath, 'utf8');

  beforeEach(() => {
    document.body.innerHTML = '';
    (window as any).currentRole = 'teacher';
    (window as any).activeGamePlayers = [{ student_name: 'Ash' }];
    (window as any).activeGamePlayerIndex = 0;
    (window as any).activeGameScores = [0];
    (window as any).setGameReplay = vi.fn();
    (window as any).resetGameTurnState = vi.fn();
    (window as any).attachGameFullscreen = vi.fn();
    (window as any).renderGamePlayerHud = vi.fn();
    (window as any).startPlayerTurnTimer = vi.fn();
    (window as any).toast = vi.fn();
    (window as any).getGameWords = vi.fn(() => [
      { vocab_word: 'PIKACHU', vocab_image: 'https://example.com/pika.png' },
      { vocab_word: 'CHARIZARD', vocab_image: 'https://example.com/char.png' }
    ]);

    // Evaluate unscramble.js in window context
    const fn = new Function('window', 'document', `${unscrambleJs}`);
    fn(window, document);
  });

  it('exposes chooseScrambleWordCount and openGameScramble on window', () => {
    expect(typeof (window as any).chooseScrambleWordCount).toBe('function');
    expect(typeof (window as any).openGameScramble).toBe('function');
  });

  it('defines scrambleSession without throwing ReferenceError', () => {
    expect('scrambleSession' in window).toBe(true);
    expect((window as any).scrambleSession).toBeNull();
  });

  it('opens Unscramble modal and renders letter tiles when openGameScramble is called', () => {
    (window as any).openGameScramble('Test List', 2, 0);

    const modal = document.querySelector('.cipher-lab-shell');
    expect(modal).not.toBeNull();

    const answer = document.querySelector('#scramble-answer');
    expect(answer).not.toBeNull();

    const tiles = document.querySelectorAll('.scramble-tile');
    expect(tiles.length).toBeGreaterThan(0);

    expect((window as any).scrambleSession).not.toBeNull();
    expect((window as any).scrambleSession.listName).toBe('Test List');
  });
});
