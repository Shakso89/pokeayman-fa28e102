import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Trophy, ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, AlertCircle, Timer } from 'lucide-react';
import type { Student } from './RoundSetupModal';
import { formatTimer } from './RoundSetupModal';
import { adjustStudentCoins } from '@/lib/class-students';

export interface GameState {
  gridDots: number; // e.g. 4 for 4x4 dots (3x3 boxes = 9 boxes) or 3 for 3x3 dots (2x2 boxes = 4 boxes)
  horizontalLines: Record<string, number | null>; // key: `${r}-${c}`, value: playerIndex
  verticalLines: Record<string, number | null>;   // key: `${r}-${c}`, value: playerIndex
  boxes: Record<string, number | null>;          // key: `${r}-${c}`, value: playerIndex
  playerScores: [number, number];                // [Player 1 boxes, Player 2 boxes]
  activePlayerIndex: 0 | 1;                      // 0 = Player 1, 1 = Player 2
  phase: 'MCQ' | 'DRAW_LINE' | 'ROUND_OVER';
  currentQuestion: {
    wordItem: any;
    options: string[];
    correctAnswer: string;
  } | null;
}

export interface DotsAndBoxesGameProps {
  players: Student[];
  vocabItems: any[];
  gridDots?: number;
  winnerCoins?: number;
  timerSeconds?: number;
  theme?: string;
  adminId?: string;
  onExit?: () => void;
  onGameOver?: (winner: Student | null, scores: [number, number]) => void;
}

export const generateMCQQuestion = (vocabItems: any[]) => {
  if (!vocabItems || vocabItems.length === 0) return null;

  // Select random item that has an image if available
  const eligibleItems = vocabItems.filter(
    (item) => item.image_url || item.vocab_image || item.image
  );
  const targetList = eligibleItems.length > 0 ? eligibleItems : vocabItems;
  const correctItem = targetList[Math.floor(Math.random() * targetList.length)];
  const correctWord = String(correctItem.word || correctItem.vocab_word || '').trim();

  // Pick 3 distractors
  const otherWords = vocabItems
    .map((item) => String(item.word || item.vocab_word || '').trim())
    .filter((w) => w && w !== correctWord);

  const uniqueDistractors = Array.from(new Set(otherWords))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  // Fallback distractors if vocab list has fewer than 4 unique words
  const fallbackWords = ['Pikachu', 'Charmander', 'Bulbasaur', 'Squirtle', 'Eevee', 'Snorlax', 'Gengar'];
  for (const fallback of fallbackWords) {
    if (uniqueDistractors.length >= 3) break;
    if (fallback !== correctWord && !uniqueDistractors.includes(fallback)) {
      uniqueDistractors.push(fallback);
    }
  }

  const options = [...uniqueDistractors, correctWord].sort(() => Math.random() - 0.5);

  return {
    wordItem: correctItem,
    options,
    correctAnswer: correctWord,
  };
};

export const playAudio = (type: 'correct' | 'wrong' | 'box_captured' | 'fanfare' | 'click') => {
  if (typeof window === 'undefined') return;

  // Try PokéAyman native sfx bridge
  const pokeSfx = (window as any).pokeSfx;
  if (pokeSfx && typeof pokeSfx.play === 'function') {
    try {
      if (type === 'correct') pokeSfx.play('correct');
      else if (type === 'wrong') pokeSfx.play('wrong');
      else if (type === 'box_captured') pokeSfx.play('correct');
      else if (type === 'fanfare') pokeSfx.play('fanfare');
      else pokeSfx.play('click');
      return;
    } catch (_) {}
  }

  // Fallback Web Audio API synthetic sounds
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'box_captured') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (_) {}
};

export const DotsAndBoxesGame: React.FC<DotsAndBoxesGameProps> = ({
  players,
  vocabItems = [],
  gridDots = 4, // 4x4 dots = 3x3 boxes (9 total boxes)
  winnerCoins = 0,
  timerSeconds = 0,
  theme = 'classroom',
  adminId = '',
  onExit,
  onGameOver,
}) => {
  // Ensure we have 2 valid players
  const player1 = players[0] || { id: 'p1', name: 'Player 1', avatar_url: '/default-pokemon.png' };
  const player2 = players[1] || { id: 'p2', name: 'Player 2', avatar_url: '/default-pokemon.png' };
  const roster = useMemo(() => [player1, player2], [player1, player2]);

  const numBoxes = Math.max(2, gridDots - 1);
  const totalPossibleBoxes = numBoxes * numBoxes;

  // Initialize lines and boxes records
  const initBoard = useCallback(() => {
    const hLines: Record<string, number | null> = {};
    for (let r = 0; r < gridDots; r++) {
      for (let c = 0; c < gridDots - 1; c++) {
        hLines[`${r}-${c}`] = null;
      }
    }

    const vLines: Record<string, number | null> = {};
    for (let r = 0; r < gridDots - 1; r++) {
      for (let c = 0; c < gridDots; c++) {
        vLines[`${r}-${c}`] = null;
      }
    }

    const bxs: Record<string, number | null> = {};
    for (let r = 0; r < numBoxes; r++) {
      for (let c = 0; c < numBoxes; c++) {
        bxs[`${r}-${c}`] = null;
      }
    }

    return { hLines, vLines, bxs };
  }, [gridDots, numBoxes]);

  const initialTimerValue = timerSeconds || 0;
  const [playerTimes, setPlayerTimes] = useState<[number, number]>([initialTimerValue, initialTimerValue]);

  const [horizontalLines, setHorizontalLines] = useState<Record<string, number | null>>(() => initBoard().hLines);
  const [verticalLines, setVerticalLines] = useState<Record<string, number | null>>(() => initBoard().vLines);
  const [boxes, setBoxes] = useState<Record<string, number | null>>(() => initBoard().bxs);
  const [playerScores, setPlayerScores] = useState<[number, number]>([0, 0]);
  const playerScoresRef = useRef(playerScores);
  playerScoresRef.current = playerScores;

  const [activePlayerIndex, setActivePlayerIndex] = useState<0 | 1>(0);
  const activeTimeLeft = playerTimes[activePlayerIndex];
  const [phase, setPhase] = useState<'MCQ' | 'DRAW_LINE' | 'ROUND_OVER'>('MCQ');
  const [currentQuestion, setCurrentQuestion] = useState<any>(() => generateMCQQuestion(vocabItems));
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [consecutiveTurns, setConsecutiveTurns] = useState<number>(0);
  const [winner, setWinner] = useState<Student | null | 'tie'>(null);
  const [isAwardingCoins, setIsAwardingCoins] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTheme, setActiveTheme] = useState<string>(theme || 'classroom');

  // Synchronize player timer banks when initialTimerValue prop changes
  useEffect(() => {
    setPlayerTimes([initialTimerValue, initialTimerValue]);
  }, [initialTimerValue]);

  useEffect(() => {
    if (theme) setActiveTheme(theme);
  }, [theme]);
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);

  const GAME_THEMES = [
    { id: 'classroom', name: 'Classroom', subtitle: 'Chalkboard style' },
    { id: 'jungle', name: 'Jungle', subtitle: 'Wild expedition' },
    { id: 'toybox', name: 'Toybox', subtitle: 'Playful blocks' },
    { id: 'halloween', name: 'Haunted Manor', subtitle: 'Spooky thrill' },
    { id: 'classic', name: 'Classic', subtitle: 'Arcade neon' },
  ];

  // Initialize first question if not yet set
  useEffect(() => {
    if (!currentQuestion && vocabItems.length > 0) {
      setCurrentQuestion(generateMCQQuestion(vocabItems));
    }
  }, [vocabItems, currentQuestion]);

  const activePlayer = roster[activePlayerIndex];

  // Finalize game handler: computes winner, triggers sounds, awards coins, and notifies parent
  const handleFinalizeGame = useCallback((overrideScores?: [number, number]) => {
    const finalScores = overrideScores || playerScoresRef.current;
    setPhase('ROUND_OVER');
    if (soundEnabled) playAudio('fanfare');

    let matchWinner: Student | null | 'tie' = null;
    if (finalScores[0] > finalScores[1]) {
      matchWinner = roster[0];
    } else if (finalScores[1] > finalScores[0]) {
      matchWinner = roster[1];
    } else {
      matchWinner = 'tie';
    }
    setWinner(matchWinner);

    if (matchWinner && matchWinner !== 'tie' && winnerCoins > 0 && matchWinner.id) {
      setIsAwardingCoins(true);
      adjustStudentCoins(String(matchWinner.id), winnerCoins, adminId || 'admin', 'Dots and Boxes victory reward')
        .catch((err) => console.warn('Could not award winner coins:', err))
        .finally(() => setIsAwardingCoins(false));
    }

    onGameOver?.(matchWinner === 'tie' ? null : matchWinner, finalScores);
  }, [adminId, onGameOver, roster, soundEnabled, winnerCoins]);

  // Dual-player independent time bank countdown: ONLY the active player's clock ticks down
  useEffect(() => {
    if (initialTimerValue === 0 || phase === 'ROUND_OVER') return;

    const intervalId = setInterval(() => {
      setPlayerTimes((prev) => {
        const next: [number, number] = [prev[0], prev[1]];
        if (next[activePlayerIndex] <= 1) {
          next[activePlayerIndex] = 0;
          clearInterval(intervalId);
          handleFinalizeGame();
          return next;
        }
        next[activePlayerIndex] = next[activePlayerIndex] - 1;
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [initialTimerValue, phase === 'ROUND_OVER', activePlayerIndex, handleFinalizeGame]);

  // Helper to pass turn (called when wrong answer or line placed without closing a box)
  const passTurnToNextPlayer = useCallback(() => {
    setActivePlayerIndex((prev) => (prev === 0 ? 1 : 0));
    setPhase('MCQ');
    setSelectedChoice(null);
    setLastAnswerStatus(null);
    setCurrentQuestion(generateMCQQuestion(vocabItems));
  }, [vocabItems]);

  // Reset or restart game
  const handleRestartGame = () => {
    const { hLines, vLines, bxs } = initBoard();
    setHorizontalLines(hLines);
    setVerticalLines(vLines);
    setBoxes(bxs);
    setPlayerScores([0, 0]);
    setActivePlayerIndex(0);
    setPlayerTimes([initialTimerValue, initialTimerValue]);
    setPhase('MCQ');
    setCurrentQuestion(generateMCQQuestion(vocabItems));
    setStatusMessage(`${roster[0].name}'s turn: Answer the question`);
    setLastAnswerStatus(null);
    setWinner(null);
  };

  // MCQ Answer Handler
  const handleAnswerMCQ = (selectedOption: string) => {
    if (!currentQuestion || phase !== 'MCQ') return;
    setSelectedChoice(selectedOption);

    if (selectedOption === currentQuestion.correctAnswer) {
      // Correct! Keep green and unlock line drawing phase (Clock continues ticking without pause!)
      if (soundEnabled) playAudio('correct');
      setLastAnswerStatus('correct');
      setPhase('DRAW_LINE');
      setStatusMessage('Awesome! Draw a line on the grid.');
    } else {
      // Wrong! Mark red, no score deduction; next player gets 2 turns in a row!
      if (soundEnabled) playAudio('wrong');
      setLastAnswerStatus('wrong');
      setConsecutiveTurns(2);

      const nextPlayer: 0 | 1 = activePlayerIndex === 0 ? 1 : 0;
      setTimeout(() => {
        setSelectedChoice(null);
        setLastAnswerStatus(null);
        setActivePlayerIndex(nextPlayer);
        setCurrentQuestion(generateMCQQuestion(vocabItems));
        setPhase('MCQ');
        setStatusMessage(`Wrong answer! ${roster[nextPlayer].name} gets 2 turns in a row!`);
      }, 700);
    }
  };

  // Handling Line Placement on the Grid
  const handleDrawLine = (type: 'H' | 'V', row: number, col: number) => {
    if (phase !== 'DRAW_LINE') return;
    const lineKey = `${row}-${col}`;

    if (type === 'H' && horizontalLines[lineKey] !== null) return;
    if (type === 'V' && verticalLines[lineKey] !== null) return;

    // 1. Mark line as drawn by active player
    const newH = { ...horizontalLines };
    const newV = { ...verticalLines };
    if (type === 'H') newH[lineKey] = activePlayerIndex;
    if (type === 'V') newV[lineKey] = activePlayerIndex;

    // 2. Check if any adjacent boxes are newly closed
    const newBoxes = { ...boxes };
    let boxesCompletedCount = 0;

    for (let r = 0; r < numBoxes; r++) {
      for (let c = 0; c < numBoxes; c++) {
        const bKey = `${r}-${c}`;
        if (newBoxes[bKey] === null) {
          const top = newH[`${r}-${c}`] !== null;
          const bottom = newH[`${r + 1}-${c}`] !== null;
          const left = newV[`${r}-${c}`] !== null;
          const right = newV[`${r}-${c + 1}`] !== null;

          if (top && bottom && left && right) {
            newBoxes[bKey] = activePlayerIndex;
            boxesCompletedCount++;
          }
        }
      }
    }

    setHorizontalLines(newH);
    setVerticalLines(newV);
    setBoxes(newBoxes);

    // 3. Update score if boxes completed
    const updatedScores: [number, number] = [
      playerScores[0] + (activePlayerIndex === 0 ? boxesCompletedCount : 0),
      playerScores[1] + (activePlayerIndex === 1 ? boxesCompletedCount : 0),
    ];

    if (boxesCompletedCount > 0) {
      setPlayerScores(updatedScores);
    }

    // 4. Check if all boxes are full (Game Over)
    const completedTotal = Object.values(newBoxes).filter((val) => val !== null).length;

    if (completedTotal >= totalPossibleBoxes) {
      handleFinalizeGame(updatedScores);
      return;
    }

    // 5. If player scored a box, they get a bonus turn; otherwise pass turn (unless 2nd consecutive turn remains)
    let nextPlayer = activePlayerIndex;
    if (boxesCompletedCount > 0) {
      // Bonus turn: activePlayerIndex remains the same
      if (soundEnabled) playAudio('box_captured');
      setStatusMessage(`🎉 Box captured! ${activePlayer.name} earns a bonus turn!`);
    } else {
      if (consecutiveTurns > 1) {
        setConsecutiveTurns((prev) => prev - 1);
        setStatusMessage(`⚡ ${activePlayer.name} gets their 2nd turn in a row!`);
      } else {
        setConsecutiveTurns(0);
        nextPlayer = activePlayerIndex === 0 ? 1 : 0;
        setActivePlayerIndex(nextPlayer);
        setStatusMessage(`${roster[nextPlayer].name}'s turn: Answer the question`);
      }
    }

    // Next round of MCQ
    setSelectedChoice(null);
    setLastAnswerStatus(null);
    setCurrentQuestion(generateMCQQuestion(vocabItems));
    setPhase('MCQ');
  };

  // Helper colors
  const player1Color = {
    name: roster[0].name,
    accent: '#fbbf24',
    bg: 'bg-amber-400',
    border: 'border-amber-400',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.5)]',
    text: 'text-amber-300',
  };

  const player2Color = {
    name: roster[1].name,
    accent: '#38bdf8',
    bg: 'bg-cyan-400',
    border: 'border-cyan-400',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.5)]',
    text: 'text-cyan-300',
  };

  // Compute CSS Grid Track Template for the interactive board
  const numTracks = gridDots * 2 - 1;
  const gridTemplate = Array.from({ length: numTracks }, (_, i) =>
    i % 2 === 0 ? '20px' : '1fr'
  ).join(' ');

  const THEME_STYLES: Record<string, {
    bg: string;
    border: string;
    cardBg: string;
    gridBg: string;
    dotBg: string;
    dotBorder: string;
    dotGlow: string;
    hudBg: string;
    choiceBtn: string;
    choiceLetter: string;
  }> = {
    classroom: {
      bg: 'bg-[#0f291e]',
      border: 'border-[#2d5a45]',
      cardBg: 'bg-[#0c2219]/90',
      gridBg: 'bg-[#081d14]',
      dotBg: 'bg-amber-300',
      dotBorder: 'border-white',
      dotGlow: 'shadow-[0_0_8px_rgba(253,224,71,0.6)]',
      hudBg: 'bg-gradient-to-b from-[#2a563d] to-[#1d3f2c] border-2 border-[#b5804c] shadow-[0_4px_0_#6e4522]',
      choiceBtn: 'bg-[#224a34] hover:bg-[#2d6144] border-2 border-[#3f7e61] hover:border-amber-400 text-[#fffbeb]',
      choiceLetter: 'bg-[#0f271b] text-amber-300 border border-[#3f7e61]',
    },
    jungle: {
      bg: 'bg-[#041f12]',
      border: 'border-[#15803d]',
      cardBg: 'bg-[#052114]/90',
      gridBg: 'bg-[#02170d]',
      dotBg: 'bg-lime-400',
      dotBorder: 'border-lime-100',
      dotGlow: 'shadow-[0_0_8px_rgba(163,230,53,0.6)]',
      hudBg: 'bg-gradient-to-b from-[#5c340e] to-[#3b1f06] border-2 border-[#d97706] shadow-[0_4px_0_#231102]',
      choiceBtn: 'bg-[#4d2807] hover:bg-[#63340b] border-2 border-[#b45309] hover:border-green-400 text-[#fef3c7]',
      choiceLetter: 'bg-[#251203] text-green-400 border border-[#78350f]',
    },
    toybox: {
      bg: 'bg-[#1a0f2e]',
      border: 'border-[#6366f1]',
      cardBg: 'bg-[#1c1034]/90',
      gridBg: 'bg-[#100820]',
      dotBg: 'bg-pink-400',
      dotBorder: 'border-pink-100',
      dotGlow: 'shadow-[0_0_8px_rgba(244,114,182,0.6)]',
      hudBg: 'bg-white border-2 border-[#6366f1] shadow-[0_4px_0_#4338ca]',
      choiceBtn: 'bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-500 text-slate-900',
      choiceLetter: 'bg-indigo-600 text-white border-transparent',
    },
    halloween: {
      bg: 'bg-[#140a17]',
      border: 'border-[#9a3412]',
      cardBg: 'bg-[#160b19]/90',
      gridBg: 'bg-[#0d0510]',
      dotBg: 'bg-orange-400',
      dotBorder: 'border-amber-100',
      dotGlow: 'shadow-[0_0_8px_rgba(251,146,60,0.6)]',
      hudBg: 'bg-gradient-to-b from-[#261230] to-[#15091c] border-2 border-[#ea580c] shadow-[0_4px_0_#7c2d12]',
      choiceBtn: 'bg-[#2d163a] hover:bg-[#3d1d4e] border-2 border-[#7c2d12] hover:border-orange-500 text-orange-100',
      choiceLetter: 'bg-[#ea580c] text-white border-transparent',
    },
    classic: {
      bg: 'bg-slate-950',
      border: 'border-slate-800',
      cardBg: 'bg-slate-900/60',
      gridBg: 'bg-[#020617]',
      dotBg: 'bg-amber-400',
      dotBorder: 'border-amber-200',
      dotGlow: 'shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      hudBg: 'bg-slate-900/90 border border-slate-800 shadow-lg',
      choiceBtn: 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-amber-400 text-slate-200',
      choiceLetter: 'bg-slate-950 text-slate-400 border border-slate-700/80',
    },
  };
  const themeStyle = THEME_STYLES[activeTheme] || THEME_STYLES.classic;

  return (
    <div className={`w-full h-[100dvh] max-h-screen overflow-hidden flex flex-col ${themeStyle.bg} border ${themeStyle.border} p-2 sm:p-4 shadow-2xl text-slate-100 relative select-none transition-colors duration-300`}>
      {/* Background ambient gradient */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
          activePlayerIndex === 0 ? 'bg-amber-400' : 'bg-cyan-400'
        }`}
      />

      {/* Top Header Bar: Title, Theme Selector & Stage Controls (NO Score Box in Header) */}
      <div className="flex-none flex items-center justify-between gap-4 pb-2 border-b border-slate-800/80 relative z-20">
        {/* Left: Exit & Sound buttons + Title */}
        <div className="flex items-center gap-3">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-black text-white leading-tight">Dots & Boxes</h2>
            <p className="text-[11px] text-amber-400 font-semibold">{gridDots}×{gridDots} Dots · {totalPossibleBoxes} Boxes</p>
          </div>
        </div>

        {/* Right: Theme Selector & Board Info */}
        <div className="flex items-center gap-2">
          {/* Visual Style / Theme Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setThemePopoverOpen(!themePopoverOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition"
              title="Change visual style"
            >
              <span>🎨</span>
              <span className="capitalize">{activeTheme}</span>
            </button>

            {themePopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase text-slate-400 px-2 py-1">Visual Style</span>
                {GAME_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTheme(t.id);
                      setThemePopoverOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeTheme === t.id
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/60'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="text-[10px] text-slate-500">{t.subtitle}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sm:hidden flex items-center text-[11px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
            {gridDots}×{gridDots}
          </div>
        </div>
      </div>

      {/* Sub-Header: Duelists Score HUD (Placed UNDER the header) */}
      <div className="flex-none flex justify-center w-full py-1 z-10">
        <div className={`flex items-center gap-3 sm:gap-6 ${themeStyle.hudBg} rounded-full px-4 sm:px-6 py-1.5 transition-all duration-300`}>
          {/* Player 1 HUD */}
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              activePlayerIndex === 0
                ? 'bg-amber-400/15 border-2 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105'
                : 'opacity-60 border border-transparent'
            }`}
          >
            <img
              src={player1.avatar_url || '/default-pokemon.png'}
              alt={player1.name}
              className="w-8 h-8 rounded-full object-contain bg-slate-950 border border-amber-400/60 p-0.5"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-amber-300 truncate max-w-[80px] sm:max-w-[100px]">
                {player1.name}
              </span>
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <span>{playerScores[0]} {playerScores[0] === 1 ? 'box' : 'boxes'}</span>
                {initialTimerValue > 0 && (
                  <span className="text-[10px] font-bold text-amber-300/80">⏱ {formatTimer(playerTimes[0])}</span>
                )}
              </span>
            </div>
            {activePlayerIndex === 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>

          {/* Center: VS and active player's remaining time bank pill */}
          {initialTimerValue > 0 ? (
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-black text-slate-500 tracking-widest">VS</span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-black transition-all ${
                  activeTimeLeft <= 10
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
                    : activeTimeLeft <= 30
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-slate-950/80 text-amber-400 border-amber-400/60 shadow-sm'
                }`}
                title="Active Player Time Bank"
              >
                <span>⏱️</span>
                <span>{formatTimer(activeTimeLeft)}</span>
              </div>
            </div>
          ) : (
            <span className="text-xs font-black text-slate-500 tracking-widest px-1">VS</span>
          )}

          {/* Player 2 HUD */}
          <div
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              activePlayerIndex === 1
                ? 'bg-cyan-400/15 border-2 border-cyan-400/80 shadow-[0_0_15px_rgba(56,189,248,0.3)] scale-105'
                : 'opacity-60 border border-transparent'
            }`}
          >
            {activePlayerIndex === 1 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
            <div className="flex flex-col text-right">
              <span className="text-xs font-black text-cyan-300 truncate max-w-[80px] sm:max-w-[100px]">
                {player2.name}
              </span>
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                {initialTimerValue > 0 && (
                  <span className="text-[10px] font-bold text-cyan-300/80">⏱ {formatTimer(playerTimes[1])}</span>
                )}
                <span>{playerScores[1]} {playerScores[1] === 1 ? 'box' : 'boxes'}</span>
              </span>
            </div>
            <img
              src={player2.avatar_url || '/default-pokemon.png'}
              alt={player2.name}
              className="w-8 h-8 rounded-full object-contain bg-slate-950 border border-cyan-400/60 p-0.5"
            />
          </div>
        </div>
      </div>

      {/* Main Game Wrapper: Fluid Flexbox with min-h-0 and aspect-square */}
      <div className="flex-1 min-h-0 w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 p-2 lg:p-4 z-10 overflow-hidden">
        {/* LEFT SIDE: MCQ Card Container */}
        <div className="w-full lg:w-[380px] h-full min-h-0 flex flex-col justify-center flex-shrink-0">
          <div className={`${themeStyle.cardBg} border ${themeStyle.border} rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col h-full min-h-0 max-h-[660px] relative overflow-hidden transition-colors duration-300`}>
            {/* Active Turn Header with Student Avatar and Name Centered */}
            <div className="flex-none flex items-center justify-center gap-3 pb-2 border-b border-slate-800/60 mb-2 w-full text-center relative" id="dots-card-header">
              <div className="flex items-center justify-center gap-3">
                <img
                  src={activePlayer.avatar_url || '/default-pokemon.png'}
                  alt={activePlayer.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain bg-slate-950 border-2 border-amber-400 shadow-md flex-shrink-0"
                />
                <span className="text-lg sm:text-xl font-black tracking-wide text-white truncate max-w-[180px] sm:max-w-[240px]">
                  {activePlayer.name}
                </span>
                {consecutiveTurns > 0 && (
                  <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                    ⚡ 2 Turns!
                  </span>
                )}
              </div>
              <span
                className={`hidden sm:inline-flex absolute right-0 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  phase === 'DRAW_LINE'
                    ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {phase === 'DRAW_LINE' ? 'Draw Line' : 'Answer MCQ'}
              </span>
            </div>

            {/* Dynamic Content Area: Image + 2x2 Options */}
            <div className="flex-1 flex flex-col min-h-0 justify-between">
              {/* Clue Area: Image Container with flex-1 and min-h-0 lets image dynamically shrink */}
              <div className="flex-1 min-h-0 h-0 rounded-2xl overflow-hidden bg-slate-950 mb-2 border border-slate-800 flex items-center justify-center p-2">
                {currentQuestion?.wordItem?.image_url ||
                currentQuestion?.wordItem?.vocab_image ||
                currentQuestion?.wordItem?.image ? (
                  <img
                    src={
                      currentQuestion.wordItem.image_url ||
                      currentQuestion.wordItem.vocab_image ||
                      currentQuestion.wordItem.image
                    }
                    alt="Question clue"
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <span className="text-3xl">🖼️</span>
                    <span className="text-xs font-semibold">Vocabulary Clue</span>
                  </div>
                )}
              </div>

              <p className="flex-none text-xs font-semibold text-slate-400 text-center mb-1.5">
                {phase === 'DRAW_LINE'
                  ? `Correct! Now tap any line on the grid.`
                  : 'Select the word that matches this picture:'}
              </p>

              {/* 2x2 Grid for Options: flex-none ensures options never get cut off */}
              <div className="flex-none grid grid-cols-2 gap-2">
                {currentQuestion?.options.map((option: string, idx: number) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isLocked = phase !== 'MCQ';
                  const isSelected = selectedChoice === option;
                  const isCorrectAnswer = option === currentQuestion?.correctAnswer;
                  const isMarkedCorrect = (isSelected && isCorrectAnswer) || (phase === 'DRAW_LINE' && isCorrectAnswer);
                  const isMarkedWrong = isSelected && !isCorrectAnswer;

                  let btnClasses = `${themeStyle.choiceBtn} active:scale-95 shadow-sm`;
                  if (isMarkedCorrect) {
                    btnClasses = 'bg-emerald-600/90 text-white border-2 border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.7)] scale-[1.02]';
                  } else if (isMarkedWrong) {
                    btnClasses = 'bg-rose-600/90 text-white border-2 border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.7)] animate-bounce';
                  } else if (isLocked) {
                    btnClasses = 'opacity-40 cursor-not-allowed border-transparent';
                  }

                  return (
                    <button
                      key={`${option}-${idx}`}
                      type="button"
                      data-testid={`mcq-option-${idx}`}
                      data-option={option}
                      data-correct={isCorrectAnswer}
                      disabled={isLocked}
                      onClick={() => handleAnswerMCQ(option)}
                      className={`group relative p-2.5 sm:p-3 rounded-xl border text-left flex items-center gap-2 transition-all duration-150 ${btnClasses}`}
                    >
                      <span className={`w-6 h-6 rounded-lg ${isMarkedCorrect ? 'bg-emerald-800 text-emerald-100' : isMarkedWrong ? 'bg-rose-800 text-rose-100' : themeStyle.choiceLetter} text-[11px] font-black flex items-center justify-center flex-shrink-0`}>
                        {letter}
                      </span>
                      <span className="text-xs sm:text-sm font-bold truncate">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Game Board Container */}
        {/* aspect-square ensures it always stays a perfect grid, taking up maximum available height without overflowing */}
        <div className="flex-1 w-full h-full min-h-0 flex flex-col items-center justify-center overflow-hidden">
          {/* Turn banner helper */}
          <div className="flex-none text-center mb-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                phase === 'DRAW_LINE'
                  ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              {phase === 'DRAW_LINE'
                ? `👉 Click an un-drawn line to place ${activePlayer.name}'s move`
                : '🔒 Locked: Answer question on the left to draw'}
            </span>
          </div>

          <div className="h-full max-h-full max-w-full aspect-square bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-6 shadow-2xl relative flex items-center justify-center min-h-0">
            {/* Board Grid Container */}
            <div
              className={`w-full h-full max-w-full max-h-full aspect-square grid items-center justify-center gap-0 p-2 sm:p-4 rounded-2xl ${themeStyle.gridBg} border ${themeStyle.border} shadow-inner transition-colors duration-300`}
              style={{
                gridTemplateColumns: gridTemplate,
                gridTemplateRows: gridTemplate,
              }}
            >
            {/* Render Nodes (Dots) */}
            {Array.from({ length: gridDots }).map((_, r) =>
              Array.from({ length: gridDots }).map((__, c) => (
                <div
                  key={`dot-${r}-${c}`}
                  style={{
                    gridRow: 2 * r + 1,
                    gridColumn: 2 * c + 1,
                  }}
                  className={`w-4 h-4 rounded-full ${themeStyle.dotBg} border-2 ${themeStyle.dotBorder} ${themeStyle.dotGlow} z-20 mx-auto transition-all duration-300`}
                />
              ))
            )}

            {/* Render Horizontal Lines */}
            {Array.from({ length: gridDots }).map((_, r) =>
              Array.from({ length: gridDots - 1 }).map((__, c) => {
                const key = `${r}-${c}`;
                const drawnOwner = horizontalLines[key];
                const isDrawn = drawnOwner !== null && drawnOwner !== undefined;
                const canDraw = phase === 'DRAW_LINE' && !isDrawn;

                let lineClass = 'h-1 bg-white/10 rounded-full';
                if (isDrawn) {
                  lineClass =
                    drawnOwner === 0
                      ? 'h-3 bg-[#facc15] border-2 border-white shadow-[0_0_14px_rgba(250,204,21,0.9)] rounded-full z-10'
                      : 'h-3 bg-[#00f0ff] border-2 border-white shadow-[0_0_14px_rgba(0,240,255,0.9)] rounded-full z-10';
                } else if (canDraw) {
                  lineClass =
                    activePlayerIndex === 0
                      ? 'h-1 bg-white/20 group-hover:h-2.5 group-hover:bg-[#facc15] group-hover:shadow-[0_0_10px_#facc15] rounded-full'
                      : 'h-1 bg-white/20 group-hover:h-2.5 group-hover:bg-[#00f0ff] group-hover:shadow-[0_0_10px_#00f0ff] rounded-full';
                }

                return (
                  <button
                    key={`h-${r}-${c}`}
                    type="button"
                    data-testid={`line-h-${r}-${c}`}
                    aria-label={`Horizontal line ${r}-${c}`}
                    disabled={!canDraw}
                    onClick={() => handleDrawLine('H', r, c)}
                    style={{
                      gridRow: 2 * r + 1,
                      gridColumn: 2 * c + 2,
                    }}
                    className={`group w-full h-full flex items-center justify-center p-0 relative transition-transform ${
                      canDraw ? 'cursor-pointer' : isDrawn ? 'cursor-default' : 'cursor-not-allowed opacity-40'
                    }`}
                  >
                    <div
                      className={`w-full transition-all duration-200 ${lineClass}`}
                    />
                  </button>
                );
              })
            )}

            {/* Render Vertical Lines */}
            {Array.from({ length: gridDots - 1 }).map((_, r) =>
              Array.from({ length: gridDots }).map((__, c) => {
                const key = `${r}-${c}`;
                const drawnOwner = verticalLines[key];
                const isDrawn = drawnOwner !== null && drawnOwner !== undefined;
                const canDraw = phase === 'DRAW_LINE' && !isDrawn;

                let lineClass = 'w-1 h-full bg-white/10 rounded-full';
                if (isDrawn) {
                  lineClass =
                    drawnOwner === 0
                      ? 'w-3 h-full bg-[#facc15] border-2 border-white shadow-[0_0_14px_rgba(250,204,21,0.9)] rounded-full z-10'
                      : 'w-3 h-full bg-[#00f0ff] border-2 border-white shadow-[0_0_14px_rgba(0,240,255,0.9)] rounded-full z-10';
                } else if (canDraw) {
                  lineClass =
                    activePlayerIndex === 0
                      ? 'w-1 h-full bg-white/20 group-hover:w-2.5 group-hover:bg-[#facc15] group-hover:shadow-[0_0_10px_#facc15] rounded-full'
                      : 'w-1 h-full bg-white/20 group-hover:w-2.5 group-hover:bg-[#00f0ff] group-hover:shadow-[0_0_10px_#00f0ff] rounded-full';
                }

                return (
                  <button
                    key={`v-${r}-${c}`}
                    type="button"
                    data-testid={`line-v-${r}-${c}`}
                    aria-label={`Vertical line ${r}-${c}`}
                    disabled={!canDraw}
                    onClick={() => handleDrawLine('V', r, c)}
                    style={{
                      gridRow: 2 * r + 2,
                      gridColumn: 2 * c + 1,
                    }}
                    className={`group w-full h-full flex flex-col items-center justify-center p-0 relative transition-transform self-stretch ${
                      canDraw ? 'cursor-pointer' : isDrawn ? 'cursor-default' : 'cursor-not-allowed opacity-40'
                    }`}
                  >
                    <div
                      className={`h-full transition-all duration-200 ${lineClass}`}
                    />
                  </button>
                );
              })
            )}

            {/* Render Boxes (Claimed territory) */}
            {Array.from({ length: numBoxes }).map((_, r) =>
              Array.from({ length: numBoxes }).map((__, c) => {
                const key = `${r}-${c}`;
                const boxOwner = boxes[key];
                const isClaimed = boxOwner !== null && boxOwner !== undefined;

                return (
                  <div
                    key={`box-${r}-${c}`}
                    data-testid={`box-${r}-${c}`}
                    style={{
                      gridRow: 2 * r + 2,
                      gridColumn: 2 * c + 2,
                    }}
                    className={`w-full h-full flex items-center justify-center rounded-xl p-1 transition-all duration-300 ${
                      isClaimed
                        ? boxOwner === 0
                          ? 'bg-amber-400/20 border border-amber-400/50 shadow-[inset_0_0_15px_rgba(251,191,36,0.3)] animate-in zoom-in-75'
                          : 'bg-cyan-400/20 border border-cyan-400/50 shadow-[inset_0_0_15px_rgba(56,189,248,0.3)] animate-in zoom-in-75'
                        : 'bg-slate-950/40 border border-slate-900/40'
                    }`}
                  >
                    {isClaimed && (
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <img
                          src={roster[boxOwner].avatar_url || '/default-pokemon.png'}
                          alt={roster[boxOwner].name}
                          className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow"
                        />
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider ${
                            boxOwner === 0 ? 'text-amber-300' : 'text-cyan-300'
                          }`}
                        >
                          {roster[boxOwner].name.slice(0, 5)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Game Over Victory Overlay Modal */}
      {phase === 'ROUND_OVER' && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-400 p-8 shadow-[0_0_40px_rgba(251,191,36,0.3)] flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                {winner === 'tie' ? "It's a Tie!" : `${(winner as Student)?.name} Wins!`}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Final Score: {player1.name} ({playerScores[0]}) — {player2.name} ({playerScores[1]})
              </p>
            </div>

            {winner !== 'tie' && winner && winnerCoins > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black">
                <Sparkles className="w-4 h-4" />
                <span>+{winnerCoins} Winner Reward Coins Awarded!</span>
              </div>
            )}

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={handleRestartGame}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
                >
                  Exit to Games
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DotsAndBoxesGame;
