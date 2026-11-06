import React, { useState } from 'react';
import {
  Shuffle,
  X,
  Plus,
  Check,
  ArrowLeft,
  ArrowRight,
  Target,
  Coins,
  Timer,
  Grid,
  Gift,
} from 'lucide-react';

export interface StepperProps {
  value: number | string;
  onDecrease: () => void;
  onIncrease: () => void;
  suffix?: string;
  format?: (value: any) => string;
  disabledDec?: boolean;
  disabledInc?: boolean;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onDecrease,
  onIncrease,
  suffix = '',
  format,
  disabledDec,
  disabledInc,
}) => (
  <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1">
    <button
      type="button"
      onClick={onDecrease}
      disabled={disabledDec}
      aria-label="−"
      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition font-bold text-sm disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
    >
      −
    </button>
    <span className="min-w-[60px] text-center text-xs font-bold text-slate-200 px-2">
      {format ? format(value) : `${value}${suffix}`}
    </span>
    <button
      type="button"
      onClick={onIncrease}
      disabled={disabledInc}
      aria-label="+"
      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition font-bold text-sm disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
    >
      +
    </button>
  </div>
);

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
  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
    <div className="flex items-center gap-2.5 text-sm font-bold text-slate-300">
      <div className="w-5 h-5 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <span>{label}</span>
    </div>
    <Stepper
      value={valueDisplay}
      onDecrease={onDecrease}
      onIncrease={onIncrease}
      disabledDec={!canDecrease}
      disabledInc={!canIncrease}
    />
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

// Allowed timer intervals in seconds (0 = No timer)
export const TIMER_OPTIONS = [0, 30, 60, 90, 120, 150, 180, 240, 300, 420, 600, 900];

// Helper to format the display pill
export const formatTimer = (val: number) => {
  if (val === 0) return 'No timer';
  if (val < 60) return `${val}s`;
  const mins = Math.floor(val / 60);
  const secs = val % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

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
  const isSurpriseBoxes = gameId === 'surprise_boxes' || gameId === 'surprise-boxes' || gameTitle.toLowerCase().includes('surprise');
  const effectiveMaxPlayers = isDotsAndBoxes ? 2 : (maxPlayers ?? 4);
  const effectiveMinPlayers = isDotsAndBoxes ? 2 : (minPlayers ?? 1);

  const [selectedPlayers, setSelectedPlayers] = useState<Student[]>([]);
  const [pointsToWin, setPointsToWin] = useState<number>(5);
  const [baamCardCount, setBaamCardCount] = useState<number>(8);
  const [powerUpsEnabled, setPowerUpsEnabled] = useState<boolean>(true);
  const [winnerCoins, setWinnerCoins] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [gridDots, setGridDots] = useState<number>(defaultGridSize);
  const [currentTheme, setCurrentTheme] = useState<string>(selectedThemeId);

  const incTimer = () => {
    const currentIndex = TIMER_OPTIONS.indexOf(timerSeconds);
    if (currentIndex < TIMER_OPTIONS.length - 1) {
      setTimerSeconds(TIMER_OPTIONS[currentIndex + 1]);
    }
  };

  const decTimer = () => {
    const currentIndex = TIMER_OPTIONS.indexOf(timerSeconds);
    if (currentIndex > 0) {
      setTimerSeconds(TIMER_OPTIONS[currentIndex - 1]);
    }
  };

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
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    setSelectedPlayers(shuffled.slice(0, capped));
  };

  const handleClearSelection = () => {
    setSelectedPlayers([]);
  };

  const canStart =
    selectedPlayers.length >= effectiveMinPlayers &&
    selectedPlayers.length <= effectiveMaxPlayers;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-3xl bg-radial from-slate-900 via-slate-950 to-slate-950 border border-slate-700/60 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(245,158,11,0.12)]">
        {/* 1. Clean Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              {gameTitle}
            </h2>
            {isDotsAndBoxes && (
              <span className="sr-only">2-Player Strategy</span>
            )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close setup and return to games"
              className="p-2 rounded-full bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 2. Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN: SELECT PLAYERS */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span>Select Players</span>
                  <span className="sr-only">Players</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {selectedPlayers.length} / {effectiveMaxPlayers} selected
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  · {classStudents.length} in class
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs font-bold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPick(effectiveMaxPlayers)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs font-bold cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Random</span>
                </button>
              </div>
            </div>

            {/* Active 4 Slots */}
            <div className={`grid gap-3 ${effectiveMaxPlayers === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {Array.from({ length: effectiveMaxPlayers }).map((_, index) => {
                const player = selectedPlayers[index];
                return player ? (
                  <button
                    key={`slot-${index}`}
                    type="button"
                    onClick={() => togglePlayer(player)}
                    title="Click to remove"
                    className="p-3 rounded-2xl bg-slate-800 border border-amber-400 ring-1 ring-amber-400/20 flex flex-col items-center justify-center gap-2 relative h-[88px] transition hover:border-amber-300 group cursor-pointer"
                  >
                    <span className="absolute top-1 left-2 text-[9px] font-black text-amber-400 uppercase">
                      P{index + 1}
                    </span>
                    <img
                      src={player.avatar_url || '/placeholder.svg'}
                      alt={player.name}
                      className="w-10 h-10 object-contain drop-shadow"
                    />
                    <span className="text-xs font-bold text-amber-400 truncate w-full text-center">
                      {player.name}
                    </span>
                  </button>
                ) : (
                  <div
                    key={`slot-${index}`}
                    className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center gap-2 h-[88px]"
                  >
                    <Plus className="w-5 h-5 text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">
                      P{index + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Remaining Roster Grid */}
            <div className="grid grid-cols-4 gap-3 mt-2 overflow-y-auto max-h-[240px] pr-2 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
              {classStudents.map((student) => {
                const isSelected = selectedPlayers.some((p) => p.id === student.id);
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => togglePlayer(student)}
                    className={`p-3 rounded-2xl border transition flex flex-col items-center gap-2 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/80 border-indigo-500/50 opacity-50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={student.avatar_url || '/placeholder.svg'}
                      alt={student.name}
                      className="w-8 h-8 object-contain drop-shadow"
                    />
                    <span className="text-xs font-bold text-slate-300 truncate w-full text-center">
                      {student.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: MATCH RULES & THEME */}
          <div className="w-full lg:w-[400px] flex flex-col gap-8">
            {/* Match Rules Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Match Rules
              </h3>
              <div className="flex flex-col gap-3">
                {isDotsAndBoxes ? (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-slate-300">
                      <Grid className="w-4 h-4 text-slate-500" />
                      <span>Grid size</span>
                    </div>
                    <Stepper
                      value={gridDots === 3 ? '3×3 (4 boxes)' : gridDots === 5 ? '5×5 (16 boxes)' : '4×4 (9 boxes)'}
                      onDecrease={() => setGridDots((v) => (v === 5 ? 4 : 3))}
                      onIncrease={() => setGridDots((v) => (v === 3 ? 4 : 5))}
                      disabledDec={gridDots <= 3}
                      disabledInc={gridDots >= 5}
                    />
                  </div>
                ) : isSurpriseBoxes ? (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center gap-2.5 text-sm font-bold text-slate-300">
                        <Grid className="w-4 h-4 text-slate-500" />
                        <span>Number of cards</span>
                      </div>
                      <Stepper
                        value={`${baamCardCount} cards`}
                        onDecrease={() => setBaamCardCount((v) => (v === 24 ? 18 : 8))}
                        onIncrease={() => setBaamCardCount((v) => (v === 8 ? 18 : 24))}
                        disabledDec={baamCardCount <= 8}
                        disabledInc={baamCardCount >= 24}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-300">
                          <Gift className="w-4 h-4 text-amber-400" />
                          <span>Enable surprise boxes</span>
                          <span className="sr-only">Power-ups</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-medium pl-6.5">
                          {powerUpsEnabled ? 'Power-ups, traps and score swaps' : 'Vocabulary questions only'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPowerUpsEnabled((v) => !v)}
                          data-testid="surprise-powerups-toggle"
                          role="switch"
                          aria-checked={powerUpsEnabled}
                          aria-label="Enable surprise boxes"
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            powerUpsEnabled ? 'bg-amber-500' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              powerUpsEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <Stepper
                          value={powerUpsEnabled ? 'Enabled' : 'Disabled'}
                          onDecrease={() => setPowerUpsEnabled(false)}
                          onIncrease={() => setPowerUpsEnabled(true)}
                          disabledDec={!powerUpsEnabled}
                          disabledInc={powerUpsEnabled}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5 text-sm font-bold text-slate-300">
                      <Target className="w-4 h-4 text-slate-500" />
                      <span>Points to Win</span>
                    </div>
                    <Stepper
                      value={pointsToWin}
                      onDecrease={() => setPointsToWin((v) => Math.max(1, v - 1))}
                      onIncrease={() => setPointsToWin((v) => Math.min(20, v + 1))}
                      suffix=" pts"
                      disabledDec={pointsToWin <= 1}
                      disabledInc={pointsToWin >= 20}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-slate-300">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>Winner Reward Coins</span>
                  </div>
                  <Stepper
                    value={winnerCoins}
                    onDecrease={() => setWinnerCoins((v) => Math.max(0, v - 5))}
                    onIncrease={() => setWinnerCoins((v) => Math.min(100, v + 5))}
                    format={(v) => (v === 0 ? 'No coins' : `${v} coins`)}
                    disabledDec={winnerCoins <= 0}
                    disabledInc={winnerCoins >= 100}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-slate-300">
                    <Timer className="w-4 h-4 text-slate-500" />
                    <span>Timer</span>
                  </div>
                  <Stepper
                    value={timerSeconds}
                    onDecrease={decTimer}
                    onIncrease={incTimer}
                    format={formatTimer}
                    disabledDec={timerSeconds <= TIMER_OPTIONS[0]}
                    disabledInc={timerSeconds >= TIMER_OPTIONS[TIMER_OPTIONS.length - 1]}
                  />
                </div>
              </div>
            </div>

            {/* Visual Style Horizontal Filmstrip */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Visual Style
              </h3>

              <div className="relative w-full">
                {/* Edge fade overlays for scroll hint */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none]">
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
                        className={`relative flex-none w-[160px] snap-start rounded-2xl border p-2 flex flex-col gap-2 text-left transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/50 shadow-lg'
                            : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="relative rounded-xl overflow-hidden h-24 bg-slate-950 border border-slate-800/50">
                          <img
                            src={th.previewUrl || '/themes/default.png'}
                            alt={th.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-slate-950 shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div className="px-1 pb-1">
                          <div className="text-[11px] font-bold text-white truncate">
                            {th.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-6 flex justify-between items-center pt-6 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onStartGame?.(selectedPlayers, {
                theme: currentTheme,
                pointsToWin,
                winnerCoins,
                timerSeconds,
                gridDots,
                gridSize: gridDots,
                cardCount: baamCardCount,
                powerUpsEnabled,
              })
            }
            disabled={!canStart}
            aria-label={`Start game · ${selectedPlayers.length} player${selectedPlayers.length === 1 ? '' : 's'} →`}
            className="px-8 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm transition flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
          >
            <span>START GAME</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
