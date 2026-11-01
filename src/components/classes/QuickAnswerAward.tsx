import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const REWARD_PRESETS = [1, 5, 10, 20];

export interface Student {
  id: string;
  name: string;
  avatar_url?: string;
  coins?: number;
}

export interface QuickAnswerAwardProps {
  students: Student[];
  onAwardCoins?: (studentId: string, amount: number) => Promise<void> | void;
  triggerCoinPopAnimation?: (studentId: string, amount: number) => void;
}

export const QuickAnswerAward: React.FC<QuickAnswerAwardProps> = ({
  students = [],
  onAwardCoins,
  triggerCoinPopAnimation = () => {},
}) => {
  const [rewardAmount, setRewardAmount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quick_award_amount');
      return saved ? Number(saved) : 5;
    } catch (_) {
      return 5;
    }
  });

  const handleSetReward = (amount: number) => {
    const safeAmount = Math.max(1, Math.min(100, amount));
    setRewardAmount(safeAmount);
    try {
      localStorage.setItem('quick_award_amount', safeAmount.toString());
    } catch (_) {}
  };

  const handleAwardCoins = async (studentId: string, amount: number) => {
    // 1. Optimistic coin increment & pop animation
    triggerCoinPopAnimation(studentId, amount);

    if (onAwardCoins) {
      await onAwardCoins(studentId, amount);
      return;
    }

    // 2. RPC call or update in Supabase
    const { error } = await supabase.rpc('increment_student_coins', {
      target_student_id: studentId,
      coin_delta: amount,
      reason: 'quick_award',
    });

    if (error) {
      console.error('Failed to award coins:', error.message);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-slate-800/80 mb-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Quick Answer Award
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tap any student below to instantly award{' '}
            <span className="text-amber-400 font-bold">+{rewardAmount} coins</span> for quick answers.
          </p>
        </div>

        {/* Reward Amount Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
          {REWARD_PRESETS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleSetReward(amt)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition active:scale-95 ${
                rewardAmount === amt
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              +{amt}
            </button>
          ))}

          {/* Step Controls for fine adjustment */}
          <div className="flex items-center border-l border-slate-800 pl-1.5 ml-0.5">
            <button
              type="button"
              onClick={() => handleSetReward(rewardAmount - 1)}
              disabled={rewardAmount <= 1}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 rounded text-xs font-bold"
              aria-label="Decrease reward amount"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => handleSetReward(rewardAmount + 1)}
              disabled={rewardAmount >= 100}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 rounded text-xs font-bold"
              aria-label="Increase reward amount"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {students.map((student) => (
          <button
            key={student.id}
            type="button"
            onClick={() => handleAwardCoins(student.id, rewardAmount)}
            className="group relative p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/80 hover:bg-slate-800/50 transition-all flex flex-col items-center justify-between gap-2.5 active:scale-95 shadow-sm cursor-pointer"
          >
            <img
              src={student.avatar_url || '/default-pokemon.png'}
              alt={student.name}
              className="w-12 h-12 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
              {student.name}
            </span>

            {/* Dynamic Coin Pill */}
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-amber-400/30 text-amber-300 font-extrabold text-[11px] group-hover:border-amber-400 group-hover:bg-amber-400/10">
              <span>+{rewardAmount}</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-sm" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const ClassLiveActivities = QuickAnswerAward;

export default QuickAnswerAward;
