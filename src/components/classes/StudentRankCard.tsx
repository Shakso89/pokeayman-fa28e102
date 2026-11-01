import React from 'react';
import { Crown, Edit2, X, Sparkles, Coins } from 'lucide-react';

export interface TopStudentCardProps {
  rank: 1 | 2 | 3;
  title: string; // "GRAND CHAMPION", "MYTHIC ELITE", "LEGENDARY ACE"
  name: string;
  coins: number;
  pokemonCount: number;
  avatarUrl: string;
  badges?: string[];
  onEdit?: () => void;
  onRemove?: () => void;
  className?: string;
}

export const TopStudentPodiumCard: React.FC<TopStudentCardProps> = ({
  rank,
  title,
  name,
  coins,
  pokemonCount,
  avatarUrl,
  badges = ['Class Champion'],
  onEdit,
  onRemove,
  className = '',
}) => {
  // Theme & Rank Styles
  const styles = {
    1: {
      card: 'bg-gradient-to-b from-amber-50 via-white to-amber-100/40 border-amber-300 shadow-[0_10px_30px_rgba(251,191,36,0.18)] dark:from-[#1c1917] dark:via-[#17130b] dark:to-[#0c0a09] dark:border-amber-400/60 dark:shadow-[0_10px_35px_rgba(251,191,36,0.15)]',
      badge: 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm',
      ring: 'border-amber-400/80 bg-amber-400/10 dark:bg-amber-400/5',
      accentText: 'text-amber-800 dark:text-amber-400',
      pill: 'bg-amber-400/15 border-amber-400/40 text-amber-900 dark:text-amber-300',
    },
    2: {
      card: 'bg-gradient-to-b from-slate-50 via-white to-slate-100/60 border-slate-300 shadow-[0_10px_30px_rgba(148,163,184,0.18)] dark:from-[#181d28] dark:via-[#0f172a] dark:to-[#0b0f17] dark:border-slate-400/50 dark:shadow-[0_10px_35px_rgba(148,163,184,0.12)]',
      badge: 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-300 dark:text-slate-950',
      ring: 'border-slate-300 bg-slate-200/20 dark:border-slate-500/50 dark:bg-slate-500/5',
      accentText: 'text-slate-700 dark:text-slate-300',
      pill: 'bg-slate-200/50 border-slate-300 text-slate-800 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200',
    },
    3: {
      card: 'bg-gradient-to-b from-orange-50 via-white to-amber-50/50 border-orange-200 shadow-[0_10px_30px_rgba(251,146,60,0.16)] dark:from-[#1e1512] dark:via-[#16100e] dark:to-[#0c0908] dark:border-orange-400/50 dark:shadow-[0_10px_35px_rgba(251,146,60,0.12)]',
      badge: 'bg-amber-700 text-amber-50 border-amber-600 dark:bg-amber-600 dark:text-slate-950',
      ring: 'border-orange-300/80 bg-orange-400/10 dark:border-orange-500/40 dark:bg-orange-500/5',
      accentText: 'text-amber-800 dark:text-amber-400',
      pill: 'bg-orange-100/60 border-orange-200 text-orange-900 dark:bg-orange-950/40 dark:border-orange-500/30 dark:text-orange-300',
    },
  }[rank];

  return (
    <div
      className={`relative w-full max-w-[260px] rounded-3xl border-2 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between ${styles.card} ${className}`}
      data-testid={`podium-card-rank-${rank}`}
    >
      {/* Top Header: Rank Tag & Quick Edit Icons */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs border ${styles.badge}`}
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              GLOBAL #{rank}
            </span>
            <span className={`text-xs font-black tracking-tight ${styles.accentText}`}>
              {title}
            </span>
          </div>
        </div>

        {/* Edit/Remove controls */}
        <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${name}`}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${name}`}
              className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Pokémon Avatar with Metallic Aura Ring */}
      <div className="my-4 flex justify-center">
        <div
          className={`relative w-28 h-28 rounded-full border-2 p-2 flex items-center justify-center transition-transform hover:scale-105 duration-300 ${styles.ring}`}
        >
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)]"
          />
        </div>
      </div>

      {/* Student Details & Score */}
      <div className="text-center space-y-1">
        <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
          {name}
        </h3>
        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400">
          <Coins className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{coins} coins</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-slate-500 font-semibold">{pokemonCount} Pokémon</span>
        </div>
      </div>

      {/* Badges / Honors */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-col gap-1.5">
        {badges.map((b, idx) => (
          <div
            key={idx}
            className={`w-full py-1.5 px-3 rounded-xl border text-[11px] font-extrabold text-center flex items-center justify-center gap-1.5 shadow-sm ${styles.pill}`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StudentRankCard = TopStudentPodiumCard;
export default TopStudentPodiumCard;
