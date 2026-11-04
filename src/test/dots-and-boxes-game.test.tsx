import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { gamesConfig, getGameConfig } from '../components/games/gamesConfig';
import { RoundSetupModal } from '../components/games/RoundSetupModal';
import {
  DotsAndBoxesGame,
  generateMCQQuestion,
} from '../components/games/DotsAndBoxesGame';
import * as classStudentsModule from '@/lib/class-students';

// Mock adjustStudentCoins to track coin awards
vi.mock('@/lib/class-students', async () => {
  const actual = await vi.importActual<any>('@/lib/class-students');
  return {
    ...actual,
    adjustStudentCoins: vi.fn().mockResolvedValue(100),
  };
});

describe('Dots and Boxes Turn-Based Vocabulary Mini-Game', () => {
  const mockVocabItems = [
    { word: 'apple', image_url: 'https://example.com/apple.png' },
    { word: 'banana', image_url: 'https://example.com/banana.png' },
    { word: 'cherry', image_url: 'https://example.com/cherry.png' },
    { word: 'dragonfruit', image_url: 'https://example.com/dragonfruit.png' },
    { word: 'elderberry', image_url: 'https://example.com/elderberry.png' },
  ];

  const mockStudents = [
    { id: 'uuid-ash', name: 'Ash Ketchum', avatar_url: '/poke-ash.png' },
    { id: 'uuid-gary', name: 'Gary Oak', avatar_url: '/poke-gary.png' },
    { id: 'uuid-brock', name: 'Brock', avatar_url: '/poke-brock.png' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Game Catalog & Setup Flow Registration', () => {
    it('registers dots_and_boxes with 2-player constraints and 4x4 default grid', () => {
      const config = getGameConfig('dots_and_boxes');
      expect(config).toBeDefined();
      expect(config?.id).toBe('dots_and_boxes');
      expect(config?.title).toBe('Dots and Boxes');
      expect(config?.minPlayers).toBe(2);
      expect(config?.maxPlayers).toBe(2);
      expect(config?.defaultGridSize).toBe(4);
      expect(config?.tags).toEqual(['2-Player', 'Strategy', 'Vocab MCQ']);

      // Also verify list in gamesConfig
      const foundInList = gamesConfig.find((g) => g.id === 'dots_and_boxes');
      expect(foundInList).toEqual(config);
    });

    it('enforces 2-player limit, grid size selection (3x3 vs 4x4), and coin rewards in RoundSetupModal', () => {
      const handleStartGame = vi.fn();

      render(
        <RoundSetupModal
          gameTitle="Dots and Boxes"
          gameId="dots_and_boxes"
          classStudents={mockStudents}
          defaultGridSize={4}
          onStartGame={handleStartGame}
        />
      );

      // Verify header and 2-player badge
      expect(screen.getByText('Dots and Boxes')).toBeInTheDocument();
      expect(screen.getByText('0 / 2 selected')).toBeInTheDocument();
      expect(screen.getByText(/2-Player Strategy/i)).toBeInTheDocument();

      // Verify Grid Size stepper with default 4x4 (9 boxes)
      expect(screen.getByText('Grid size')).toBeInTheDocument();
      expect(screen.getByText('4×4 (9 boxes)')).toBeInTheDocument();

      // Test Grid Size stepper decrease to 3x3 (4 boxes)
      const allMinusButtons = screen.getAllByRole('button', { name: '−' });
      // The grid size stepper is the first stepper row
      const gridSizeMinus = allMinusButtons[0];
      fireEvent.click(gridSizeMinus);
      expect(screen.getByText('3×3 (4 boxes)')).toBeInTheDocument();

      // At 3x3, decrease should be disabled
      expect(gridSizeMinus).toBeDisabled();

      // Test Grid Size stepper increase back to 4x4 (9 boxes)
      const allPlusButtons = screen.getAllByRole('button', { name: '+' });
      const gridSizePlus = allPlusButtons[0];
      fireEvent.click(gridSizePlus);
      expect(screen.getByText('4×4 (9 boxes)')).toBeInTheDocument();

      // Test Grid Size stepper increase to 5x5 (16 boxes)
      fireEvent.click(gridSizePlus);
      expect(screen.getByText('5×5 (16 boxes)')).toBeInTheDocument();
      expect(gridSizePlus).toBeDisabled();

      // Test coin rewards stepper (second stepper row)
      const coinsPlus = allPlusButtons[1];
      fireEvent.click(coinsPlus);
      expect(screen.getByText('5 coins')).toBeInTheDocument();

      // Select players: Player 1 and Player 2
      const ashBtn = screen.getByText('Ash Ketchum');
      const garyBtn = screen.getByText('Gary Oak');
      const brockBtn = screen.getByText('Brock');

      fireEvent.click(ashBtn);
      expect(screen.getByText('1 / 2 selected')).toBeInTheDocument();

      fireEvent.click(garyBtn);
      expect(screen.getByText('2 / 2 selected')).toBeInTheDocument();

      // Attempting to select a 3rd player is blocked by the 2-player cap
      fireEvent.click(brockBtn);
      expect(screen.getByText('2 / 2 selected')).toBeInTheDocument();

      // Start button should be enabled for 2 players
      const startBtn = screen.getByRole('button', { name: /Start game · 2 players →/i });
      expect(startBtn).not.toBeDisabled();

      fireEvent.click(startBtn);
      expect(handleStartGame).toHaveBeenCalledWith(
        [
          expect.objectContaining({ name: 'Ash Ketchum' }),
          expect.objectContaining({ name: 'Gary Oak' }),
        ],
        expect.objectContaining({
          gridDots: 5,
          gridSize: 5,
          winnerCoins: 5,
        })
      );
    });
  });

  describe('2. MCQ Question Generation Logic', () => {
    it('generates an MCQ question with 1 correct answer and 3 unique distractors', () => {
      const q = generateMCQQuestion(mockVocabItems);
      expect(q).not.toBeNull();
      expect(q?.options).toHaveLength(4);
      expect(q?.options).toContain(q?.correctAnswer);

      // Verify distractors are different from correct answer
      const distractors = q?.options.filter((opt) => opt !== q?.correctAnswer);
      expect(distractors).toHaveLength(3);
      expect(new Set(q?.options).size).toBe(4);
    });

    it('prioritizes vocabulary items with images', () => {
      const mixedItems = [
        { word: 'noimage1' },
        { word: 'withimage', image_url: 'https://example.com/test.png' },
        { word: 'noimage2' },
      ];
      const q = generateMCQQuestion(mixedItems);
      expect(q?.wordItem.word).toBe('withimage');
      expect(q?.correctAnswer).toBe('withimage');
    });
  });

  describe('3. Pre-Move MCQ Turn Consequences', () => {
    it('starts with Player 1 in MCQ phase with the line grid locked', () => {
      render(
        <DotsAndBoxesGame
          players={mockStudents.slice(0, 2)}
          vocabItems={mockVocabItems}
          gridDots={3}
        />
      );

      // HUD and Card Header indicate Player 1's turn
      expect(screen.getAllByText("Ash Ketchum").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText(/Locked: Answer question on the left to draw/i)).toBeInTheDocument();

      // A horizontal line should be disabled/unclickable in MCQ phase
      const lineH00 = screen.getByTestId('line-h-0-0');
      expect(lineH00).toBeDisabled();
    });

    it('awards opponent 2 turns on incorrect answer without deducting points', async () => {
      render(
        <DotsAndBoxesGame
          players={mockStudents.slice(0, 2)}
          vocabItems={mockVocabItems}
          gridDots={3}
        />
      );

      // Find an incorrect button using data-correct="false"
      const incorrectBtn = document.querySelector('[data-correct="false"]') as HTMLButtonElement;
      expect(incorrectBtn).not.toBeNull();

      fireEvent.click(incorrectBtn);

      // Player 2 gets the turn after wrong feedback
      await waitFor(() => {
        expect(screen.getAllByText("Gary Oak").length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText(/2 Turns!/i)).toBeInTheDocument();
      });
    });

    it('unlocks line drawing phase and keeps answer green upon correct MCQ answer', () => {
      render(
        <DotsAndBoxesGame
          players={mockStudents.slice(0, 2)}
          vocabItems={mockVocabItems}
          gridDots={3}
        />
      );

      // Click the correct answer button
      const correctBtn = document.querySelector('[data-correct="true"]') as HTMLButtonElement;
      expect(correctBtn).not.toBeNull();

      fireEvent.click(correctBtn);

      // DRAW_LINE phase unlocked
      expect(screen.getByText('Draw Line')).toBeInTheDocument();
      expect(correctBtn.className).toContain('bg-emerald-600/90');

      // Horizontal line is now clickable
      const lineH00 = screen.getByTestId('line-h-0-0');
      expect(lineH00).not.toBeDisabled();
    });
  });

  describe('4. Grid Line Drawing, Box Capture & Bonus Turns', () => {
    it('draws horizontal and vertical lines and captures a 1x1 box with bonus turn award', () => {
      render(
        <DotsAndBoxesGame
          players={mockStudents.slice(0, 2)}
          vocabItems={mockVocabItems}
          gridDots={3} // 3x3 dots = 2x2 boxes (4 total boxes)
        />
      );

      // Helper to solve whatever MCQ is currently active to enter DRAW_LINE
      const unlockDraw = () => {
        const correctBtn = document.querySelector('[data-correct="true"]') as HTMLButtonElement;
        if (correctBtn) fireEvent.click(correctBtn);
      };

      // Turn 1: Draw Top of Box (0,0) -> Line H 0-0
      unlockDraw();
      fireEvent.click(screen.getByTestId('line-h-0-0'));

      // Turn 2: Draw Bottom of Box (0,0) -> Line H 1-0
      unlockDraw();
      fireEvent.click(screen.getByTestId('line-h-1-0'));

      // Turn 3: Draw Left of Box (0,0) -> Line V 0-0
      unlockDraw();
      fireEvent.click(screen.getByTestId('line-v-0-0'));

      // Box (0,0) is not yet closed (needs Right line V 0-1)
      const box00Before = screen.getByTestId('box-0-0');
      expect(box00Before).not.toHaveTextContent(/ASH|GARY/i);

      // Turn 4: Draw Right of Box (0,0) -> Line V 0-1 to CLOSE the box!
      unlockDraw();
      fireEvent.click(screen.getByTestId('line-v-0-1'));

      // Box (0,0) is now completed!
      const box00After = screen.getByTestId('box-0-0');
      expect(box00After).toHaveTextContent(/ASH|GARY/i);

      // Player who closed the box earned at least 1 box point
      const scoreMatches = screen.getAllByText(/1 box/i);
      expect(scoreMatches.length).toBeGreaterThan(0);
    });

    it('ends game and awards winner coins in Supabase when all boxes are completed', async () => {
      const handleGameOver = vi.fn();

      render(
        <DotsAndBoxesGame
          players={mockStudents.slice(0, 2)}
          vocabItems={mockVocabItems}
          gridDots={3} // 2x2 boxes = 4 boxes total
          winnerCoins={15}
          adminId="admin-teacher-uuid"
          onGameOver={handleGameOver}
        />
      );

      const unlockDraw = () => {
        const correctBtn = document.querySelector('[data-correct="true"]') as HTMLButtonElement;
        if (correctBtn) fireEvent.click(correctBtn);
      };

      // Draw all horizontal lines: 3 rows x 2 cols = 6 lines
      const hLinesToDraw = ['0-0', '0-1', '1-0', '1-1', '2-0', '2-1'];
      for (const key of hLinesToDraw) {
        if (screen.queryByText(/Wins!|Tie!/i)) break;
        unlockDraw();
        const line = screen.getByTestId(`line-h-${key}`);
        if (!line.hasAttribute('disabled')) {
          fireEvent.click(line);
        }
      }

      // Draw all vertical lines: 2 rows x 3 cols = 6 lines
      const vLinesToDraw = ['0-0', '0-1', '0-2', '1-0', '1-1', '1-2'];
      for (const key of vLinesToDraw) {
        if (screen.queryByText(/Wins!|Tie!/i)) break;
        unlockDraw();
        const line = screen.getByTestId(`line-v-${key}`);
        if (!line.hasAttribute('disabled')) {
          fireEvent.click(line);
        }
      }

      // Once all lines are drawn, game over modal should appear
      expect(screen.getByText(/Wins!|Tie!/i)).toBeInTheDocument();
      expect(screen.getByText(/Play Again/i)).toBeInTheDocument();
      expect(handleGameOver).toHaveBeenCalledTimes(1);

      // Verify coin award was called if a player won with coins
      if (screen.queryByText(/\+15 Winner Reward Coins Awarded!/i)) {
        await waitFor(() => {
          expect(classStudentsModule.adjustStudentCoins).toHaveBeenCalledWith(
            expect.stringMatching(/uuid-ash|uuid-gary/),
            15,
            'admin-teacher-uuid',
            'Dots and Boxes victory reward'
          );
        });
      }
    });

    it('adapts the score HUD and answer buttons UI dynamically based on the active theme', () => {
      const { rerender } = render(
        <DotsAndBoxesGame
          players={mockStudents.slice(0, 2)}
          vocabItems={mockVocabItems}
          theme="classroom"
        />
      );

      // In classroom theme, score HUD has chalkboard styling
      const scoreHud = document.querySelector('.flex.justify-center.w-full > div');
      expect(scoreHud?.className).toContain('from-[#2a563d]');
      expect(scoreHud?.className).toContain('border-[#b5804c]');

      // Answer buttons have classroom styling
      const optionBtn = screen.getByTestId('mcq-option-0');
      expect(optionBtn.className).toContain('bg-[#224a34]');
      expect(optionBtn.className).toContain('border-[#3f7e61]');

      // Switch to toybox theme
      rerender(
        <DotsAndBoxesGame
          players={mockStudents.slice(0, 2)}
          vocabItems={mockVocabItems}
          theme="toybox"
        />
      );

      expect(scoreHud?.className).toContain('bg-white');
      expect(scoreHud?.className).toContain('border-[#6366f1]');
      expect(optionBtn.className).toContain('bg-white');
      expect(optionBtn.className).toContain('border-indigo-200');
    });
  });
});
