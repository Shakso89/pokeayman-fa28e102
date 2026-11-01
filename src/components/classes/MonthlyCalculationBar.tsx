import React from 'react';

export interface MonthlyCalculationPillProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MonthlyCalculationPill: React.FC<MonthlyCalculationPillProps> = ({
  label,
  isActive = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 px-5 rounded-2xl text-xs font-bold transition-all border ${
        isActive
          ? 'bg-amber-400/20 border-amber-400 text-amber-950 dark:bg-amber-400/20 dark:border-amber-400 dark:text-amber-300 shadow-sm'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800'
      } ${className}`}
    >
      {label}
    </button>
  );
};

export interface MonthlyCalculationBarProps {
  items: Array<{ id: string; label: string; active?: boolean }>;
  onSelect?: (id: string) => void;
  className?: string;
}

export const MonthlyCalculationBar: React.FC<MonthlyCalculationBarProps> = ({
  items,
  onSelect,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 flex-wrap p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 ${className}`}>
      {items.map((item) => (
        <MonthlyCalculationPill
          key={item.id}
          label={item.label}
          isActive={item.active}
          onClick={() => onSelect?.(item.id)}
        />
      ))}
    </div>
  );
};

export default MonthlyCalculationBar;
