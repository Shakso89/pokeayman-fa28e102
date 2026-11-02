import React, { useState, useMemo } from 'react';
import { Shuffle, X, Trophy, Clock, Grid, Sparkles } from 'lucide-react';

export interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  valueDisplay: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
}

export const SettingStepperRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  valueDisplay,
  onDecrease,
  onIncrease,
  canDecrease,
  canIncrease,
}) => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-900/50 border border-slate-800/80 shadow-md hover:border-slate-700/80 transition-all">
    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200">
      <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-amber-400">
        {icon}
      </div>
      <span className="tracking-wide uppercase text-[11px] text-slate-300">{label}</span>
    </div>
    <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-full px-1 py-0.5 shadow-inner">
      <button
        type="button"
        disabled={!canDecrease}
        onClick={onDecrease}
        aria-label="−"
        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-25 disabled:hover:text-slate-400 text-sm font-black transition rounded-full hover:bg-slate-800/60 active:scale-95"
      >
        −
      </button>
      <span className="min-w-[84px] text-center text-xs font-black text-amber-300 px-1 tracking-tight">
        {valueDisplay}
      </span>
      <button
        type="button"
        disabled={!canIncrease}
        onClick={onIncrease}
        aria-label="+"
        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-25 disabled:hover:text-slate-400 text-sm font-black transition rounded-full hover:bg-slate-800/60 active:scale-95"
      >
        +
      </button>
    </div>
  </div>
);

export interface Student {
  id: string | number;
  name: string;
  avatar_url?: string;
}

export interface GameTheme {
  id: string;
  name: string;
  subtitle: string;
  previewUrl?: string;
}

export interface RoundSetupModalProps {
  gameTitle?: string;
  gameId?: string;
  classStudents?: Student[];
  themes?: GameTheme[];
  selectedThemeId?: string;
  defaultGridSize?: number;
  minPlayers?: number;
  maxPlayers?: number;
  onSelectTheme?: (themeId: string) => void;
  onStartGame?: (selectedStudents: Student[], settings: any) => void;
  onClose?: () => void;
}

export const RoundSetupModal: React.FC<RoundSetupModalProps> = ({
  gameTitle = 'Match Words',
  gameId,
  classStudents = [],
  themes = [],
  selectedThemeId = 'halloween',
  defaultGridSize = 4,
  minPlayers,
  maxPlayers,
  onSelectTheme,
  onStartGame,
  onClose,
}) => {
  const isDotsAndBoxes = gameId === 'dots_and_boxes' || gameTitle.toLowerCase().includes('dots');
  const effectiveMaxPlayers = isDotsAndBoxes ? 2 : (maxPlayers ?? 4);
  const effectiveMinPlayers = isDotsAndBoxes ? 2 : (minPlayers ?? 1);

  const [selectedPlayers, setSelectedPlayers] = useState<Student[]>([]);
  const [quickPickCount, setQuickPickCount] = useState<number>(2);
  const [pointsToWin, setPointsToWin] = useState<number>(5);
  const [winnerCoins, setWinnerCoins] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [gridDots, setGridDots] = useState<number>(defaultGridSize);
  const [currentTheme, setCurrentTheme] = useState<string>(selectedThemeId);

  const togglePlayer = (student: Student) => {
    setSelectedPlayers((prev) => {
      const exists = prev.some((p) => p.id === student.id);
      if (exists) {
        return prev.filter((p) => p.id !== student.id);
      }
      if (prev.length >= effectiveMaxPlayers) return prev;
      return [...prev, student];
    });
  };

  const handleQuickPick = (count: number) => {
    const capped = Math.min(count, effectiveMaxPlayers);
    setQuickPickCount(capped);
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    setSelectedPlayers(shuffled.slice(0, capped));
  };

  const handleShuffleSelection = () => {
    const capped = Math.min(quickPickCount, effectiveMaxPlayers);
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    setSelectedPlayers(shuffled.slice(0, capped));
  };

  const handleClearSelection = () => {
    setSelectedPlayers([]);
  };

  const currentThemeObj = useMemo(
    () => themes.find((t) => t.id === currentTheme) || themes[0],
    [themes, currentTheme]
  );

  const canStart =
    selectedPlayers.length >= effectiveMinPlayers &&
    selectedPlayers.length <= effectiveMaxPlayers;

  const playerColorStyles = [
    { border: 'border-sky-400', bg: 'bg-sky-500/20', tag: 'bg-sky-600', ring: 'shadow-[0_0_15px_rgba(56,189,248,0.35)]' },
    { border: 'border-red-400', bg: 'bg-red-500/20', tag: 'bg-red-600', ring: 'shadow-[0_0_15px_rgba(248,113,113,0.35)]' },
    { border: 'border-emerald-400', bg: 'bg-emerald-500/20', tag: 'bg-emerald-600', ring: 'shadow-[0_0_15px_rgba(74,222,128,0.35)]' },
    { border: 'border-amber-400', bg: 'bg-amber-500/20', tag: 'bg-amber-600', ring: 'shadow-[0_0_15px_rgba(251,191,36,0.35)]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-950 border border-slate-700/60 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(245,158,11,0.12)]">
        {/* Header Marquee */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300">
                  🕹️ Match Lobby
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isDotsAndBoxes ? 'Round setup · 2-Player Strategy' : 'Round setup'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                {gameTitle}
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close setup and return to games"
              className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-400 hover:text-white hover:border-red-500/60 hover:bg-red-500/20 flex items-center justify-center transition-all hover:rotate-90"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Players & Parameter Steppers */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Header: Player Selection & Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">Players</span>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {selectedPlayers.length} / {effectiveMaxPlayers} selected
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">· {classStudents.length} in class</span>
              </div>

              <div className="flex items-center gap-1.5">
                {isDotsAndBoxes ? (
                  <button
                    type="button"
                    onClick={() => handleQuickPick(2)}
                    className="h-8 px-3 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:border-amber-400 transition shadow-sm"
                  >
                    Quick Pick 2
                  </button>
                ) : (
                  <select
                    value={quickPickCount}
                    onChange={(e) => handleQuickPick(Number(e.target.value))}
                    className="h-8 px-2.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value={2}>Random 2</option>
                    <option value={3}>Random 3</option>
                    <option value={4}>Random 4</option>
                  </select>
                )}

                <button
                  type="button"
                  onClick={handleShuffleSelection}
                  title="Shuffle Selection"
                  aria-label="Shuffle selection"
                  className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                {selectedPlayers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="h-8 px-3 rounded-full bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-xs font-bold text-slate-400 hover:text-rose-400 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Challenger Lineup Podiums */}
            <div className={`grid gap-2 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 ${
              effectiveMaxPlayers === 2 ? 'grid-cols-2' : 'grid-cols-4'
            }`}>
              {Array.from({ length: effectiveMaxPlayers }).map((_, idx) => {
                const player = selectedPlayers[idx];
                const pNum = idx + 1;
                const style = playerColorStyles[idx] || playerColorStyles[0];

                if (player) {
                  return (
                    <div
                      key={idx}
                      className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl border bg-slate-900/90 transition-all ${style.border} ${style.ring}`}
                    >
                      <span className={`absolute top-1.5 left-2 text-[9px] font-black text-white px-1.5 py-0.2 rounded-full uppercase ${style.tag}`}>
                        P{pNum}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePlayer(player)}
                        title="Remove player"
                        aria-label="Remove player"
                        className="absolute top-1 right-1.5 w-4 h-4 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center text-[10px] transition"
                      >
                        ×
                      </button>
                      <div className="w-9 h-9 flex items-center justify-center mt-1">
                        <img
                          src={player.avatar_url || '/placeholder.svg'}
                          alt={player.name}
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>
                      <span className="text-[11px] font-black text-white truncate max-w-full px-1">
                        {player.name}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 min-h-[72px] text-slate-600"
                  >
                    <div className="w-6 h-6 rounded-full border border-dashed border-slate-700/60 flex items-center justify-center text-[11px]">
                      +
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Player {pNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Student Roster Deck */}
            <div className="max-h-[160px] overflow-y-auto pr-1.5 space-y-2 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
              <div className="grid grid-cols-3 gap-2">
                {classStudents.map((student) => {
                  const playerIdx = selectedPlayers.findIndex((p) => p.id === student.id);
                  const isSelected = playerIdx !== -1;
                  const pNum = playerIdx + 1;
                  const style = playerColorStyles[playerIdx] || playerColorStyles[0];

                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => togglePlayer(student)}
                      className={`relative p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                        isSelected
                          ? `${style.bg} ${style.border} ${style.ring}`
                          : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90'
                      }`}
                    >
                      {isSelected && (
                        <span className={`absolute top-1.5 left-2 text-[9px] font-black text-white px-1.5 py-0.2 rounded-full uppercase ${style.tag}`}>
                          P{pNum}
                        </span>
                      )}
                      <img
                        src={student.avatar_url || '/placeholder.svg'}
                        alt={student.name}
                        className="w-10 h-10 object-contain drop-shadow"
                      />
                      <span className={`text-xs font-bold truncate max-w-[85px] ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {student.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper Rows: Game Parameters */}
            <div className="space-y-2 mt-1">
              {isDotsAndBoxes ? (
                <SettingStepperRow
                  icon={<Grid className="w-4 h-4" />}
                  label="Grid size"
                  valueDisplay={
                    gridDots === 3
                      ? '3×3 (4 boxes)'
                      : gridDots === 5
                      ? '5×5 (16 boxes)'
                      : '4×4 (9 boxes)'
                  }
                  onDecrease={() => setGridDots((v) => (v === 5 ? 4 : 3))}
                  onIncrease={() => setGridDots((v) => (v === 3 ? 4 : 5))}
                  canDecrease={gridDots > 3}
                  canIncrease={gridDots < 5}
                />
              ) : (
                <SettingStepperRow
                  icon={<Trophy className="w-4 h-4" />}
                  label="Points to win"
                  valueDisplay={`${pointsToWin} pts`}
                  onDecrease={() => setPointsToWin((v) => Math.max(1, v - 1))}
                  onIncrease={() => setPointsToWin((v) => Math.min(20, v + 1))}
                  canDecrease={pointsToWin > 1}
                  canIncrease={pointsToWin < 20}
                />
              )}

              <SettingStepperRow
                icon={<span className="text-xs">🪙</span>}
                label="Winner reward coins"
                valueDisplay={winnerCoins === 0 ? 'No coins' : `${winnerCoins} coins`}
                onDecrease={() => setWinnerCoins((v) => Math.max(0, v - 5))}
                onIncrease={() => setWinnerCoins((v) => Math.min(100, v + 5))}
                canDecrease={winnerCoins > 0}
                canIncrease={winnerCoins < 100}
              />

              <SettingStepperRow
                icon={<Clock className="w-4 h-4" />}
                label="Timer"
                valueDisplay={timerSeconds === 0 ? 'No timer' : `${Math.floor(timerSeconds / 60)} min`}
                onDecrease={() => setTimerSeconds((v) => Math.max(0, v - 60))}
                onIncrease={() => setTimerSeconds((v) => Math.min(600, v + 60))}
                canDecrease={timerSeconds > 0}
                canIncrease={timerSeconds < 600}
              />
            </div>
          </div>

          {/* Right Column: Theme Selector Grid */}
          <div className="md:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">Visual style</span>
              <span className="text-[11px] text-amber-400 font-bold truncate max-w-[180px]">
                {currentThemeObj ? `${currentThemeObj.name} · ${currentThemeObj.subtitle}` : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
              {themes.map((th) => {
                const isSelected = currentTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setCurrentTheme(th.id);
                      onSelectTheme?.(th.id);
                    }}
                    className={`relative rounded-2xl border p-2 flex flex-col gap-1.5 text-left transition-all group ${
                      isSelected
                        ? 'bg-slate-900/90 border-amber-400 ring-2 ring-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative rounded-xl overflow-hidden h-14 w-full bg-slate-950">
                      <img
                        src={th.previewUrl || '/themes/default.png'}
                        alt={th.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-md">
                          ✓
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                        {th.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {th.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 transition"
          >
            ← Games
          </button>
          <button
            type="button"
            disabled={!canStart}
            onClick={() =>
              onStartGame?.(selectedPlayers, {
                theme: currentTheme,
                pointsToWin,
                winnerCoins,
                timerSeconds,
                gridDots,
                gridSize: gridDots,
              })
            }
            className={`px-7 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
              canStart
                ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50'
            }`}
          >
            Start game · {selectedPlayers.length} player{selectedPlayers.length === 1 ? '' : 's'} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoundSetupModal;
