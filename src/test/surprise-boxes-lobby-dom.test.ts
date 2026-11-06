import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

describe('Surprise Boxes Lobby DOM rendering', () => {
  it('renders Power-ups stepper when gaEnhanceLobby is invoked for Surprise Boxes', () => {
    const arcadeJs = fs.readFileSync('public/pokeayman/games-arcade.js', 'utf8');

    // Create a mock DOM
    document.body.innerHTML = `
      <div id="modal" class="game-setup-panel">
        <div id="game-player-list">
          <label class="game-player-card-option"><input type="checkbox" class="game-player-check" value="a"></label>
          <label class="game-player-card-option"><input type="checkbox" class="game-player-check" value="b"></label>
          <label class="game-player-card-option"><input type="checkbox" class="game-player-check" value="c"></label>
          <label class="game-player-card-option"><input type="checkbox" class="game-player-check" value="Ayman"></label>
        </div>
        <div class="mb-4 text-left">
          <h3 class="text-sm font-black text-amber-100 mb-2">Number of cards</h3>
          <div class="grid grid-cols-3 gap-2" role="group" aria-label="Number of cards">
            <button type="button" class="shared-baam-count game-timer-option is-selected" data-count="8">8 cards</button>
            <button type="button" class="shared-baam-count game-timer-option" data-count="18">18 cards</button>
            <button type="button" class="shared-baam-count game-timer-option" data-count="24">24 cards</button>
          </div>
          <label class="flex items-center gap-2 text-sm font-semibold text-indigo-50 mt-3">
            <input id="shared-baam-powerups" type="checkbox" checked class="accent-teal-400"> Enable all power-ups
          </label>
        </div>
        <button id="game-players-next">Continue</button>
        <button id="game-players-cancel">Cancel</button>
      </div>
    `;

    const modal = document.getElementById('modal')!;
    modal.dataset.gaGameFn = 'chooseBaamboozlePowerUps';
    modal.dataset.gaGameName = 'Surprise Boxes';

    (window as any).gaIsTeacherThemeEnabled = () => false;
    (window as any).getTeacherCredits = () => 20;
    if (!window.HTMLElement.prototype.scrollIntoView) {
      window.HTMLElement.prototype.scrollIntoView = () => {};
    }

    // Run arcadeJs inside sandbox
    const run = new Function('window', 'document', 'modal', `${arcadeJs}\nwindow.gaEnhanceLobby(modal, 'chooseBaamboozlePowerUps');`);
    run(window, document, modal);

    const params = modal.querySelector('.ga-params-section');
    expect(params).not.toBeNull();

    const stepperPanels = Array.from(params!.querySelectorAll('.ga-stepper-panel'));
    expect(stepperPanels.length).toBe(4);

    const labels = stepperPanels.map(p => p.querySelector('.truncate')?.textContent?.trim());
    expect(labels).toEqual(['Number of cards', 'Power-ups', 'Winner reward coins', 'Timer']);

    // Verify Power-ups defaults to Enabled
    const powerupPanel = stepperPanels[1];
    expect(powerupPanel.getAttribute('data-testid')).toBe('surprise-powerups-stepper');
    const val = powerupPanel.querySelector('.ga-stepper-val')?.textContent?.trim();
    expect(val).toBe('Enabled');
  });
});
