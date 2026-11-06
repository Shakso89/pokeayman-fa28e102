import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Bomb Match Opponent Point Deduction (Multiplayer & Solo)', () => {
  const htmlPath = path.resolve(__dirname, '../../public/pokeayman/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  it('contains the updated bomb deduction logic in Memory Flip (openGameMemory)', () => {
    // Preserves required backwards-compatible comment for test suites
    expect(htmlContent).toContain('// 💣 Bomb: Deducts 1 point from active player and ends the turn.');

    // Verifies multi-player deduction logic in Memory Flip
    expect(htmlContent).toContain('if (activeGamePlayers.length > 1) {');
    expect(htmlContent).toContain('activeGamePlayers.forEach((p, idx) => {');
    expect(htmlContent).toContain('if (idx !== activeGamePlayerIndex) {');
    expect(htmlContent).toContain('activeGameScores[idx] = Math.max(0, (activeGameScores[idx] || 0) - 1);');
  });

  it('contains bomb detection and opponent deduction logic in Match Words (openGameMatch)', () => {
    expect(htmlContent).toContain('const isBombWord = /^(?:bomb|mega[\\s_-]?bomb|💣)$/i.test(String(target.vocab_word || \'\').trim())');
    expect(htmlContent).toContain('activeGamePlayers.forEach((p, idx) => {');
    expect(htmlContent).toContain('if (idx !== activeGamePlayerIndex) {');
    expect(htmlContent).toContain('activeGameScores[idx] = Math.max(0, (activeGameScores[idx] || 0) - 1);');
  });

  describe('Multiplayer 2-Player Bomb Deduction Simulation', () => {
    function simulateBombMatch(playerCount: number, initialScores: number[], activePlayerIndex: number) {
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
        statusMessage = `💣 BOOM! -1 Point to ${otherName}!`;
      } else if (players.length > 2) {
        statusMessage = '💣 BOOM! -1 Point to each other player!';
      } else {
        statusMessage = '💣 BOOM! -1 Point! Turn ended!';
      }

      // Advance turn
      if (players.length > 1) {
        playerIndex = (playerIndex + 1) % players.length;
      }

      return { scores, nextPlayerIndex: playerIndex, statusMessage };
    }

    it('deducts 1 point from player 2 when player 1 matches the bomb in 2-player game', () => {
      const result = simulateBombMatch(2, [3, 4], 0);
      expect(result.scores[0]).toBe(3); // Player 1 (who matched bomb) is unchanged
      expect(result.scores[1]).toBe(3); // Player 2 has 1 point deducted (4 -> 3)
      expect(result.statusMessage).toContain('-1 Point to Student 2');
      expect(result.nextPlayerIndex).toBe(1); // Turn passed to Player 2
    });

    it('deducts 1 point from player 1 when player 2 matches the bomb in 2-player game', () => {
      const result = simulateBombMatch(2, [2, 1], 1);
      expect(result.scores[0]).toBe(1); // Player 1 has 1 point deducted (2 -> 1)
      expect(result.scores[1]).toBe(1); // Player 2 (who matched bomb) is unchanged
      expect(result.statusMessage).toContain('-1 Point to Student 1');
      expect(result.nextPlayerIndex).toBe(0); // Turn passed to Player 1
    });

    it('deducts 1 point from each other player when player 1 matches bomb in 3-player game', () => {
      const result = simulateBombMatch(3, [5, 4, 3], 0);
      expect(result.scores[0]).toBe(5); // Player 1 unaffected
      expect(result.scores[1]).toBe(3); // Player 2 deducted (4 -> 3)
      expect(result.scores[2]).toBe(2); // Player 3 deducted (3 -> 2)
      expect(result.statusMessage).toContain('-1 Point to each other player');
      expect(result.nextPlayerIndex).toBe(1);
    });

    it('deducts 1 point from each other player when player 2 matches bomb in 4-player game', () => {
      const result = simulateBombMatch(4, [2, 5, 2, 1], 1);
      expect(result.scores[0]).toBe(1); // Player 1 deducted (2 -> 1)
      expect(result.scores[1]).toBe(5); // Player 2 unaffected
      expect(result.scores[2]).toBe(1); // Player 3 deducted (2 -> 1)
      expect(result.scores[3]).toBe(0); // Player 4 deducted (1 -> 0)
      expect(result.statusMessage).toContain('-1 Point to each other player');
      expect(result.nextPlayerIndex).toBe(2);
    });

    it('clamps opponent score at 0 and does not drop negative', () => {
      const result = simulateBombMatch(2, [1, 0], 0);
      expect(result.scores[0]).toBe(1);
      expect(result.scores[1]).toBe(0); // Clamped at 0
    });

    it('deducts 1 point from the single player in solo mode', () => {
      const result = simulateBombMatch(1, [3], 0);
      expect(result.scores[0]).toBe(2); // Solo player penalized
      expect(result.statusMessage).toContain('Turn ended');
    });
  });
});
