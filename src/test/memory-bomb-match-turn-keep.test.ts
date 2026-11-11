import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Memory Game: Bomb Match Opponent Deduction and Retain Turn to Play Again', () => {
  const memoryJsPath = path.resolve(__dirname, '../../public/pokeayman/memory-flip.js');
  const indexHtmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');

  const memoryJs = fs.readFileSync(memoryJsPath, 'utf8');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  it('ensures memory-flip.js does not advance turn when bomb is matched', () => {
    // Extract the kind === 'bomb' block in memory-flip.js
    const bombBlockMatch = memoryJs.match(/if\s*\(\s*kind\s*===\s*'bomb'\s*\)\s*\{([\s\S]*?)\}\s*else\s*if\s*\(\s*kind\s*===\s*'magnet'/);
    expect(bombBlockMatch).not.toBeNull();
    const bombBlock = bombBlockMatch![1];

    // advanceGameTurn() must NOT be called in the bomb match block
    expect(bombBlock).not.toContain('advanceGameTurn()');

    // Opponent deduction must be present
    expect(bombBlock).toContain('activeGameScores[idx] = Math.max(0, (activeGameScores[idx] || 0) - 1);');

    // Status message should indicate player can play again
    expect(bombBlock).toContain('Play again!');
  });

  it('ensures index.html does not advance turn when bomb is matched', () => {
    // Extract the kind === 'bomb' block in index.html for Memory Flip
    const bombBlockMatch = indexHtml.match(/if\s*\(\s*kind\s*===\s*'bomb'\s*\)\s*\{([\s\S]*?)\}\s*else\s*if\s*\(\s*kind\s*===\s*'magnet'/);
    expect(bombBlockMatch).not.toBeNull();
    const bombBlock = bombBlockMatch![1];

    expect(bombBlock).not.toContain('advanceGameTurn()');
    expect(bombBlock).toContain('activeGameScores[idx] = Math.max(0, (activeGameScores[idx] || 0) - 1);');
    expect(bombBlock).toContain('Play again!');
  });

  describe('Simulation of Bomb Match Turn Retention & Score Deduction', () => {
    function simulateMemoryBombMatch(playerCount: number, initialScores: number[], activePlayerIndex: number) {
      const players = Array.from({ length: playerCount }, (_, i) => ({ student_name: `Student ${i + 1}` }));
      const scores = [...initialScores];
      let playerIndex = activePlayerIndex;
      let statusMessage = '';

      if (players.length > 1) {
        players.forEach((_, idx) => {
          if (idx !== playerIndex) {
            scores[idx] = Math.max(0, (scores[idx] || 0) - 1);
          }
        });
      } else if (players.length === 1) {
        scores[0] = Math.max(0, (scores[0] || 0) - 1);
      }

      if (players.length === 2) {
        const otherIdx = playerIndex === 0 ? 1 : 0;
        const otherName = players[otherIdx]?.student_name || 'Opponent';
        statusMessage = `💣 BOOM! -1 Point to ${otherName}! Play again!`;
      } else if (players.length > 2) {
        statusMessage = '💣 BOOM! -1 Point to each other player! Play again!';
      } else {
        statusMessage = '💣 BOOM! -1 Point! Play again!';
      }

      // DO NOT advance turn: player matched a pair, so they keep turn and play again!
      return { scores, nextPlayerIndex: playerIndex, statusMessage };
    }

    it('deducts 1 point from player 2 and lets player 1 play again in 2-player game', () => {
      const result = simulateMemoryBombMatch(2, [3, 4], 0);
      expect(result.scores[0]).toBe(3); // Player 1 score unchanged
      expect(result.scores[1]).toBe(3); // Player 2 penalized (4 -> 3)
      expect(result.nextPlayerIndex).toBe(0); // Player 1 keeps turn
      expect(result.statusMessage).toContain('Play again!');
    });

    it('deducts 1 point from player 1 and lets player 2 play again in 2-player game', () => {
      const result = simulateMemoryBombMatch(2, [2, 1], 1);
      expect(result.scores[0]).toBe(1); // Player 1 penalized (2 -> 1)
      expect(result.scores[1]).toBe(1); // Player 2 score unchanged
      expect(result.nextPlayerIndex).toBe(1); // Player 2 keeps turn
      expect(result.statusMessage).toContain('Play again!');
    });

    it('deducts 1 point from other players and keeps active turn in 3-player game', () => {
      const result = simulateMemoryBombMatch(3, [5, 4, 3], 0);
      expect(result.scores[0]).toBe(5); // Player 1 unaffected
      expect(result.scores[1]).toBe(3); // Player 2 deducted (4 -> 3)
      expect(result.scores[2]).toBe(2); // Player 3 deducted (3 -> 2)
      expect(result.nextPlayerIndex).toBe(0); // Player 1 keeps turn
      expect(result.statusMessage).toContain('Play again!');
    });
  });
});
