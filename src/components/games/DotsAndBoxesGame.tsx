import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Trophy, ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import type { Student } from './RoundSetupModal';
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

  const [horizontalLines, setHorizontalLines] = useState<Record<string, number | null>>(() => initBoard().hLines);
  const [verticalLines, setVerticalLines] = useState<Record<string, number | null>>(() => initBoard().vLines);
  const [boxes, setBoxes] = useState<Record<string, number | null>>(() => initBoard().bxs);
  const [playerScores, setPlayerScores] = useState<[number, number]>([0, 0]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<0 | 1>(0);
  const [phase, setPhase] = useState<'MCQ' | 'DRAW_LINE' | 'ROUND_OVER'>('MCQ');
  const [currentQuestion, setCurrentQuestion] = useState<any>(() => generateMCQQuestion(vocabItems));
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastAnswerStatus, setLastAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [winner, setWinner] = useState<Student | null | 'tie'>(null);
  const [isAwardingCoins, setIsAwardingCoins] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTheme, setActiveTheme] = useState<string>(theme || 'classroom');
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

  // Reset or restart game
  const handleRestartGame = () => {
    const { hLines, vLines, bxs } = initBoard();
    setHorizontalLines(hLines);
    setVerticalLines(vLines);
    setBoxes(bxs);
    setPlayerScores([0, 0]);
    setActivePlayerIndex(0);
    setPhase('MCQ');
    setCurrentQuestion(generateMCQQuestion(vocabItems));
    setStatusMessage(`${roster[0].name}'s turn: Answer the question`);
    setLastAnswerStatus(null);
    setWinner(null);
  };

  // MCQ Answer Handler
  const handleAnswerMCQ = (selectedOption: string) => {
    if (!currentQuestion || phase !== 'MCQ') return;

    if (selectedOption === currentQuestion.correctAnswer) {
      // Correct! Unlock the line drawing phase
      if (soundEnabled) playAudio('correct');
      setLastAnswerStatus('correct');
      setPhase('DRAW_LINE');
      setStatusMessage('Awesome! Draw a line on the grid.');
    } else {
      // Wrong! Apply -1 penalty and pass turn
      if (soundEnabled) playAudio('wrong');
      setLastAnswerStatus('wrong');
      setPlayerScores((prev) => {
        const updated = [...prev] as [number, number];
        updated[activePlayerIndex] = Math.max(0, updated[activePlayerIndex] - 1);
        return updated;
      });

      // Switch player and load next question
      const nextPlayer: 0 | 1 = activePlayerIndex === 0 ? 1 : 0;
      setActivePlayerIndex(nextPlayer);
      setCurrentQuestion(generateMCQQuestion(vocabItems));
      setPhase('MCQ');
      setStatusMessage(`Oops! -1 penalty. ${roster[nextPlayer].name}'s turn: Answer the question`);
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
      setPhase('ROUND_OVER');
      if (soundEnabled) playAudio('fanfare');

      let matchWinner: Student | null | 'tie' = null;
      if (updatedScores[0] > updatedScores[1]) {
        matchWinner = roster[0];
      } else if (updatedScores[1] > updatedScores[0]) {
        matchWinner = roster[1];
      } else {
        matchWinner = 'tie';
      }
      setWinner(matchWinner);

      // Award coins to winner in Supabase
      if (matchWinner && matchWinner !== 'tie' && winnerCoins > 0 && matchWinner.id) {
        setIsAwardingCoins(true);
        adjustStudentCoins(String(matchWinner.id), winnerCoins, adminId || 'admin', 'Dots and Boxes victory reward')
          .catch((err) => console.warn('Could not award winner coins:', err))
          .finally(() => setIsAwardingCoins(false));
      }

      onGameOver?.(matchWinner === 'tie' ? null : matchWinner, updatedScores);
      return;
    }

    // 5. If player scored a box, they get a bonus turn; otherwise pass turn
    let nextPlayer = activePlayerIndex;
    if (boxesCompletedCount > 0) {
      // Bonus turn: activePlayerIndex remains the same
      if (soundEnabled) playAudio('box_captured');
      setStatusMessage(`🎉 Box captured! ${activePlayer.name} earns a bonus turn!`);
    } else {
      // Next player turn
      nextPlayer = activePlayerIndex === 0 ? 1 : 0;
      setActivePlayerIndex(nextPlayer);
      setStatusMessage(`${roster[nextPlayer].name}'s turn: Answer the question`);
    }

    // Next round of MCQ
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
    i % 2 === 0 ? '18px' : 'minmax(50px, 80px)'
  ).join(' ');

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-2xl flex flex-col gap-6 text-slate-100 relative overflow-hidden select-none">
      {/* Background ambient gradient */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
          activePlayerIndex === 0 ? 'bg-amber-400' : 'bg-cyan-400'
        }`}
      />

      {/* Top Header Bar: Title, Theme Selector & Stage Controls (NO Score Box in Header) */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800/80 relative z-20">
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
      <div className="flex justify-center w-full py-1">
        <div className="flex items-center gap-3 sm:gap-6 bg-slate-900/90 border border-slate-800 rounded-full px-4 sm:px-6 py-2 shadow-lg">
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
              <span className="text-[11px] font-bold text-slate-300">
                {playerScores[0]} {playerScores[0] === 1 ? 'box' : 'boxes'}
              </span>
            </div>
            {activePlayerIndex === 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>

          <span className="text-xs font-black text-slate-500 tracking-widest px-1">VS</span>

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
              <span className="text-[11px] font-bold text-slate-300">
                {playerScores[1]} {playerScores[1] === 1 ? 'box' : 'boxes'}
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

      {/* Dynamic Status Notification Banner */}
      <div
        className={`w-full py-2 px-4 rounded-xl text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all duration-300 ${
          phase === 'DRAW_LINE'
            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : activePlayerIndex === 0
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
        }`}
      >
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        <span>
          {statusMessage ||
            (phase === 'DRAW_LINE'
              ? 'Awesome! Draw a line on the grid.'
              : `${activePlayer.name}'s turn: Answer the vocabulary question!`)}
        </span>
      </div>

      {/* 2-Column Split: Left MCQ Question Card | Right Dots & Boxes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Section: Question Card */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          {/* Active Turn Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  activePlayerIndex === 0 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
              />
              <span className="text-xs font-black tracking-wide text-white uppercase">
                {activePlayer.name}'s Challenge
              </span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                phase === 'DRAW_LINE'
                  ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {phase === 'DRAW_LINE' ? 'Grid Unlocked' : 'MCQ Step'}
            </span>
          </div>

          {/* Clue Area: Image or Visual Prompt */}
          <div className="flex-1 flex flex-col items-center justify-center p-2 min-h-[190px]">
            {currentQuestion?.wordItem?.image_url ||
            currentQuestion?.wordItem?.vocab_image ||
            currentQuestion?.wordItem?.image ? (
              <div className="relative group rounded-xl overflow-hidden bg-slate-950/80 border border-slate-700/80 p-2 shadow-md max-h-48 flex items-center justify-center">
                <img
                  src={
                    currentQuestion.wordItem.image_url ||
                    currentQuestion.wordItem.vocab_image ||
                    currentQuestion.wordItem.image
                  }
                  alt="Vocabulary clue"
                  className="max-h-40 max-w-full object-contain rounded-lg transition-transform group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="w-full h-36 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
                <span className="text-3xl">🖼️</span>
                <span className="text-xs font-semibold">Vocabulary Clue</span>
              </div>
            )}

            <p className="text-xs font-semibold text-slate-400 text-center mt-3">
              {phase === 'DRAW_LINE'
                ? `Correct! The target word was "${currentQuestion?.correctAnswer}". Now tap any line on the grid.`
                : 'Select the word that matches this picture:'}
            </p>
          </div>

          {/* 4 Choices Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {currentQuestion?.options.map((option: string, idx: number) => {
              const letter = String.fromCharCode(65 + idx);
              const isLocked = phase !== 'MCQ';
              return (
                <button
                  key={`${option}-${idx}`}
                  type="button"
                  data-testid={`mcq-option-${idx}`}
                  data-option={option}
                  data-correct={option === currentQuestion?.correctAnswer}
                  disabled={isLocked}
                  onClick={() => handleAnswerMCQ(option)}
                  className={`group relative p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-150 ${
                    isLocked
                      ? 'bg-slate-900/40 border-slate-800/60 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-amber-400 active:scale-95 shadow-sm text-slate-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700/80 text-[11px] font-black text-slate-400 flex items-center justify-center group-hover:text-amber-300 group-hover:border-amber-400/60">
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

        {/* Right Section: Interactive Dots & Boxes Board */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative min-h-[420px]">
          {/* Turn banner helper */}
          <div className="text-center mb-5">
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

          {/* Board Grid Container */}
          <div
            className="grid items-center justify-center gap-0 p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-2xl"
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
                  className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 border-2 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)] z-20 mx-auto"
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

                let lineClass = 'bg-slate-800/50';
                if (isDrawn) {
                  lineClass =
                    drawnOwner === 0
                      ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                      : 'bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]';
                } else if (canDraw) {
                  lineClass =
                    activePlayerIndex === 0
                      ? 'bg-slate-700/80 group-hover:bg-amber-400/80'
                      : 'bg-slate-700/80 group-hover:bg-cyan-400/80';
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
                      className={`w-full h-2 rounded transition-all duration-200 ${lineClass}`}
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

                let lineClass = 'bg-slate-800/50';
                if (isDrawn) {
                  lineClass =
                    drawnOwner === 0
                      ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                      : 'bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.8)]';
                } else if (canDraw) {
                  lineClass =
                    activePlayerIndex === 0
                      ? 'bg-slate-700/80 group-hover:bg-amber-400/80'
                      : 'bg-slate-700/80 group-hover:bg-cyan-400/80';
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
                    className={`group w-full h-full flex items-center justify-center p-0 relative transition-transform ${
                      canDraw ? 'cursor-pointer' : isDrawn ? 'cursor-default' : 'cursor-not-allowed opacity-40'
                    }`}
                  >
                    <div
                      className={`w-2 h-full rounded transition-all duration-200 ${lineClass}`}
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
