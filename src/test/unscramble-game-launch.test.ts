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

  it('renders in-game Easy and Hard difficulty buttons and controls picture clue visibility', () => {
    (window as any).openGameScramble('Test List', 2, 0, 'easy');

    const easyBtn = document.querySelector('#scramble-easy-btn') as HTMLButtonElement;
    const hardBtn = document.querySelector('#scramble-hard-btn') as HTMLButtonElement;
    const clue = document.querySelector('#scramble-clue') as HTMLElement;

    expect(easyBtn).not.toBeNull();
    expect(hardBtn).not.toBeNull();
    expect(clue).not.toBeNull();

    // 1. Easy mode by default reveals the picture
    expect(easyBtn.getAttribute('aria-pressed')).toBe('true');
    expect(hardBtn.getAttribute('aria-pressed')).toBe('false');
    expect(easyBtn.classList.contains('ring-4')).toBe(true);
    const easyImg = clue.querySelector('img');
    expect(easyImg).not.toBeNull();
    expect(easyImg?.src).toMatch(/pika\.png|char\.png/);

    // 2. Switching to Hard mode hides the picture
    hardBtn.click();
    expect(hardBtn.getAttribute('aria-pressed')).toBe('true');
    expect(easyBtn.getAttribute('aria-pressed')).toBe('false');
    expect(hardBtn.classList.contains('ring-4')).toBe(true);
    expect((window as any).scrambleSession.difficulty).toBe('hard');
    // Picture of word must be hidden
    const hardImg = clue.querySelector('img');
    const showsWordPic = hardImg && (hardImg.src.includes('pika.png') || hardImg.src.includes('char.png'));
    expect(showsWordPic).toBeFalsy();

    // 3. Switching back to Easy reveals the picture again
    easyBtn.click();
    expect(easyBtn.getAttribute('aria-pressed')).toBe('true');
    expect(hardBtn.getAttribute('aria-pressed')).toBe('false');
    expect((window as any).scrambleSession.difficulty).toBe('easy');
    const restoredImg = clue.querySelector('img');
    expect(restoredImg?.src).toMatch(/pika\.png|char\.png/);
  });

  it('starts in Hard mode when requested and conceals picture clue', () => {
    (window as any).openGameScramble('Test List', 2, 0, 'hard');

    const easyBtn = document.querySelector('#scramble-easy-btn') as HTMLButtonElement;
    const hardBtn = document.querySelector('#scramble-hard-btn') as HTMLButtonElement;
    const clue = document.querySelector('#scramble-clue') as HTMLElement;

    expect(hardBtn.getAttribute('aria-pressed')).toBe('true');
    expect(easyBtn.getAttribute('aria-pressed')).toBe('false');
    expect((window as any).scrambleSession.difficulty).toBe('hard');

    const img = clue.querySelector('img');
    const showsWordPic = img && (img.src.includes('pika.png') || img.src.includes('char.png'));
    expect(showsWordPic).toBeFalsy();
  });
});
