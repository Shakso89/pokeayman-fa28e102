import React, { useState, useMemo } from 'react';
import { Shuffle, X, Check, Search } from 'lucide-react';

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
  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
    <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </div>
    <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-0.5">
      <button
        type="button"
        disabled={!canDecrease}
        onClick={onDecrease}
        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold transition rounded"
      >
        −
      </button>
      <span className="min-w-[70px] text-center text-xs font-black text-slate-200 px-1">
        {valueDisplay}
      </span>
      <button
        type="button"
        disabled={!canIncrease}
        onClick={onIncrease}
        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 text-sm font-bold transition rounded"
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
  classStudents?: Student[];
  themes?: GameTheme[];
  selectedThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
  onStartGame?: (selectedStudents: Student[], settings: any) => void;
  onClose?: () => void;
}

export const RoundSetupModal: React.FC<RoundSetupModalProps> = ({
  gameTitle = 'Match Words',
  classStudents = [],
  themes = [],
  selectedThemeId = 'halloween',
  onSelectTheme,
  onStartGame,
  onClose,
}) => {
  const [selectedPlayers, setSelectedPlayers] = useState<Student[]>([]);
  const [quickPickCount, setQuickPickCount] = useState<number>(2);
  const [pointsToWin, setPointsToWin] = useState<number>(5);
  const [winnerCoins, setWinnerCoins] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [currentTheme, setCurrentTheme] = useState<string>(selectedThemeId);

  const togglePlayer = (student: Student) => {
    setSelectedPlayers((prev) => {
      const exists = prev.some((p) => p.id === student.id);
      if (exists) {
        return prev.filter((p) => p.id !== student.id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, student];
    });
  };

  const handleQuickPick = (count: number) => {
    setQuickPickCount(count);
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    setSelectedPlayers(shuffled.slice(0, Math.min(count, 4)));
  };

  const handleShuffleSelection = () => {
    const shuffled = [...classStudents].sort(() => 0.5 - Math.random());
    setSelectedPlayers(shuffled.slice(0, Math.min(quickPickCount, 4)));
  };

  const handleClearSelection = () => {
    setSelectedPlayers([]);
  };

  const currentThemeObj = useMemo(
    () => themes.find((t) => t.id === currentTheme) || themes[0],
    [themes, currentTheme]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {gameTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Round setup</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">Players</span>
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {selectedPlayers.length} / 4 selected
                </span>
                <span className="text-[11px] text-slate-500">· {classStudents.length} in class</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Quick Pick Dropdown */}
                <select
                  value={quickPickCount}
                  onChange={(e) => handleQuickPick(Number(e.target.value))}
                  className="h-8 px-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value={2}>Random 2</option>
                  <option value={3}>Random 3</option>
                  <option value={4}>Random 4</option>
                </select>

                {/* Shuffle Button */}
                <button
                  type="button"
                  onClick={handleShuffleSelection}
                  title="Shuffle Selection"
                  className="h-8 w-8 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                {/* Clear Button */}
                {selectedPlayers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="h-8 px-2.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-rose-500/50 text-xs font-semibold text-slate-400 hover:text-rose-400 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Student Scroll Area */}
            <div className="max-h-[175px] overflow-y-auto pr-1.5 space-y-2 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
              <div className="grid grid-cols-3 gap-2.5">
                {classStudents.map((student) => {
                  const isSelected = selectedPlayers.some((p) => p.id === student.id);
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => togglePlayer(student)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={student.avatar_url || '/default-pokemon.png'}
                        alt={student.name}
                        className="w-9 h-9 object-contain"
                      />
                      <span
                        className={`text-xs font-bold truncate max-w-[85px] ${
                          isSelected ? 'text-amber-300' : 'text-slate-300'
                        }`}
                      >
                        {student.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unified Stepper Rows */}
            <div className="flex flex-col gap-2.5 mt-2">
              <SettingStepperRow
                icon={<span className="text-sm">🎯</span>}
                label="Points to win"
                valueDisplay={`${pointsToWin} pts`}
                onDecrease={() => setPointsToWin((v) => Math.max(1, v - 1))}
                onIncrease={() => setPointsToWin((v) => Math.min(20, v + 1))}
                canDecrease={pointsToWin > 1}
                canIncrease={pointsToWin < 20}
              />

              <SettingStepperRow
                icon={<span className="text-sm">🪙</span>}
                label="Winner reward coins"
                valueDisplay={winnerCoins === 0 ? 'No coins' : `${winnerCoins} coins`}
                onDecrease={() => setWinnerCoins((v) => Math.max(0, v - 5))}
                onIncrease={() => setWinnerCoins((v) => Math.min(100, v + 5))}
                canDecrease={winnerCoins > 0}
                canIncrease={winnerCoins < 100}
              />

              <SettingStepperRow
                icon={<span className="text-sm">⏱️</span>}
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
              <span className="text-xs font-bold text-slate-200">Visual style</span>
              <span className="text-[11px] text-amber-400 font-semibold">
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
                    className={`relative rounded-xl border p-2 flex flex-col gap-1.5 text-left transition group ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative rounded-lg overflow-hidden h-14 w-full bg-slate-950">
                      <img
                        src={th.previewUrl || '/themes/default.png'}
                        alt={th.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-black">
                          ✓
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {th.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
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
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
          >
            ← Games
          </button>
          <button
            type="button"
            disabled={selectedPlayers.length === 0}
            onClick={() =>
              onStartGame?.(selectedPlayers, {
                theme: currentTheme,
                pointsToWin,
                winnerCoins,
                timerSeconds,
              })
            }
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              selectedPlayers.length > 0
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
