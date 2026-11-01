import React from 'react';
import { Send } from 'lucide-react';

export interface TransferCreditsButtonProps {
  onTransferCredits?: () => void;
  className?: string;
  disabled?: boolean;
}

export const TransferCreditsButton: React.FC<TransferCreditsButtonProps> = ({
  onTransferCredits,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onTransferCredits}
      disabled={disabled}
      className={`w-full py-2.5 px-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm
        bg-white hover:bg-amber-50 text-slate-800 border-2 border-amber-400/80 hover:border-amber-500 hover:shadow-[0_0_15px_rgba(251,191,36,0.25)]
        dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-amber-300 dark:border-amber-400/60 ${className}`}
    >
      <Send className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
      <span>Transfer credits</span>
    </button>
  );
};

export default TransferCreditsButton;
