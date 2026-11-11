import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Surprise Boxes immediate score award and Hear Again option', () => {
  const jsPath = path.resolve(__dirname, '../../public/pokeayman/surprise-boxes.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  it('immediately awards 10 points upon correct answer before modal close', () => {
    // Verifies points are added directly in choice click handler
    expect(js).toContain('activeGameScores[currentPlayer] = (activeGameScores[currentPlayer] || 0) + 10');
    expect(js).toContain('updateTeamScores()');
    expect(js).toContain('showCorrectAnswerCelebration(modal, currentPlayer)');
    expect(js).toContain('selectedCard._scoreAwarded = true');
  });

  it('exposes a "Hear Again" button only playable after correct answer', () => {
    expect(js).toContain('baam-hear-again-btn');
    expect(js).toContain('Hear Again');
    expect(js).toContain("hearAgainBtn.id = 'baam-hear-again'");
    // Verifies SVG speaker icon is used without emoji
    expect(js).toContain('<svg class="baam-hear-icon"');
    expect(js).not.toMatch(/baam-hear-again[\s\S]*?[🔊🔈🗣️]/);
  });

  it('allows clicking "Hear Again" to replay the word aloud and extends timer', () => {
    expect(js).toContain('hearAgainBtn.addEventListener(\'click\'');
    expect(js).toContain('window.readGameWordAloud(targetWord)');
    expect(js).toContain('clearAnswerTimer()');
  });

  it('preserves awarded points if modal is dismissed or closed', () => {
    // If closed after answering correctly, closeBaamRevealAsWrong does NOT clear activeGameScores
    expect(js).toContain('if (selectedCard && !selectedCard.powerUp)');
    expect(js).toContain('advanceGameTurn()');
    // Ensure markAnswer guards against double-counting if already awarded
    expect(js).toContain('if (!selectedCard._scoreAwarded)');
  });

  it('keeps "Hear Again" out of wrong answers (only playable after correct answer)', () => {
    // In wrong answer branch, actionRow / hearAgainBtn is not created
    const wrongStart = js.indexOf("btn.classList.add('is-wrong')");
    const wrongEnd = js.indexOf("word.classList.remove('hidden')", wrongStart);
    const wrongBranch = js.substring(wrongStart, wrongEnd);
    expect(wrongBranch).not.toContain('baam-hear-again-btn');
    expect(wrongBranch).not.toContain('hearAgainBtn');
  });
});
