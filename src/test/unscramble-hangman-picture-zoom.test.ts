import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Unscramble & Hangman Picture Zoom Lightbox', () => {
  const unscramblePath = path.resolve(__dirname, '../../public/pokeayman/unscramble.js');
  const unscrambleJs = fs.readFileSync(unscramblePath, 'utf8');

  const hangmanPath = path.resolve(__dirname, '../../public/pokeayman/hangman.js');
  const hangmanJs = fs.readFileSync(hangmanPath, 'utf8');

  const gamesArcadeCssPath = path.resolve(__dirname, '../../public/pokeayman/games-arcade.css');
  const gamesArcadeCss = fs.readFileSync(gamesArcadeCssPath, 'utf8');

  beforeEach(() => {
    document.body.innerHTML = '';
    (window as any).currentRole = 'teacher';
    (window as any).activeGamePlayers = [{ student_name: 'Ash' }, { student_name: 'Gary' }];
    (window as any).activeGamePlayerIndex = 0;
    (window as any).activeGameScores = [0, 0];
    (window as any).activeGamePlayerRemaining = [60, 60];
    (window as any).activeGamePlayerEliminated = [false, false];
    (window as any).setGameReplay = vi.fn();
    (window as any).resetGameTurnState = vi.fn();
    (window as any).attachGameFullscreen = vi.fn();
    (window as any).renderGamePlayerHud = vi.fn();
    (window as any).startPlayerTurnTimer = vi.fn();
    (window as any).toast = vi.fn();
    (window as any).getGameWords = vi.fn(() => [
      { vocab_word: 'PIKACHU', vocab_image: 'https://example.com/pika.png' }
    ]);
  });

  it('Unscramble: provides click-to-zoom on clue picture and opens/closes lightbox', () => {
    const fn = new Function('window', 'document', `${unscrambleJs}`);
    fn(window, document);

    (window as any).openGameScramble('Test List', 1, 0, 'easy');

    const clue = document.querySelector('#scramble-clue') as HTMLElement;
    expect(clue).not.toBeNull();
    expect(clue.style.cursor).toBe('zoom-in');
    expect(clue.querySelector('.dots-clue-zoom-hint')?.textContent).toContain('Zoom');

    const lightbox = document.querySelector('#scramble-img-lightbox') as HTMLElement;
    const lightboxImg = document.querySelector('#scramble-lightbox-img') as HTMLImageElement;
    const closeBtn = document.querySelector('#scramble-lightbox-close') as HTMLButtonElement;

    expect(lightbox).not.toBeNull();
    expect(lightbox.hidden).toBe(true);

    // Click clue box to open lightbox
    clue.click();
    expect(lightbox.hidden).toBe(false);
    expect(lightbox.classList.contains('is-open')).toBe(true);
    expect(lightboxImg.src).toBe('https://example.com/pika.png');

    // Close using close button
    closeBtn.click();
    expect(lightbox.hidden).toBe(true);
    expect(lightbox.classList.contains('is-open')).toBe(false);

    // Click clue again and close with Escape key
    clue.click();
    expect(lightbox.hidden).toBe(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(lightbox.hidden).toBe(true);
  });

  it('Hangman: provides click-to-zoom on clue picture and opens/closes lightbox', () => {
    const fn = new Function('window', 'document', `${hangmanJs}`);
    fn(window, document);

    (window as any).openGameHangman('Test List', 1, 0, 'easy', true);

    const clue = document.querySelector('#hangman-clue') as HTMLElement;
    expect(clue).not.toBeNull();
    expect(clue.style.cursor).toBe('zoom-in');
    expect(clue.querySelector('.dots-clue-zoom-hint')?.textContent).toContain('Zoom');

    const lightbox = document.querySelector('#hangman-img-lightbox') as HTMLElement;
    const lightboxImg = document.querySelector('#hangman-lightbox-img') as HTMLImageElement;
    const closeBtn = document.querySelector('#hangman-lightbox-close') as HTMLButtonElement;

    expect(lightbox).not.toBeNull();
    expect(lightbox.hidden).toBe(true);

    // Click clue box to open lightbox
    clue.click();
    expect(lightbox.hidden).toBe(false);
    expect(lightbox.classList.contains('is-open')).toBe(true);
    expect(lightboxImg.src).toBe('https://example.com/pika.png');

    // Close using close button
    closeBtn.click();
    expect(lightbox.hidden).toBe(true);
    expect(lightbox.classList.contains('is-open')).toBe(false);

    // Click clue again and close with Escape key
    clue.click();
    expect(lightbox.hidden).toBe(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(lightbox.hidden).toBe(true);
  });

  it('verifies games-arcade.css has lightbox and zoom cursor styles for both games', () => {
    expect(gamesArcadeCss).toContain('.dots-lightbox');
    expect(gamesArcadeCss).toContain('.dots-lightbox-backdrop');
    expect(gamesArcadeCss).toContain('.dots-lightbox-content');
    expect(gamesArcadeCss).toContain('.dots-lightbox-close');
    expect(gamesArcadeCss).toContain('.dots-lightbox-img');
    expect(gamesArcadeCss).toContain('#hangman-clue[style*="zoom-in"]');
    expect(gamesArcadeCss).toContain('#scramble-clue[style*="zoom-in"]');
  });
});
