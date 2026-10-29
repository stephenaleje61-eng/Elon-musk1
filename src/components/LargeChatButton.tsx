import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface LargeChatButtonProps {
  onClick: () => void;
  variant?: 'hero' | 'compact' | 'nav';
  className?: string;
  showSubtitle?: boolean;
}

export const LargeChatButton: React.FC<LargeChatButtonProps> = ({
  onClick,
  variant = 'hero',
  className = '',
  showSubtitle = true
}) => {
  if (variant === 'nav') {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 bg-white text-black text-xs font-bold tracking-wider uppercase rounded-lg hover:bg-neutral-200 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap shadow-sm ${className}`}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>CHAT ELON MUSK</span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={`w-full sm:w-auto px-6 py-3.5 bg-white text-black font-extrabold text-sm tracking-wider uppercase rounded-xl hover:bg-neutral-100 transition-all duration-150 active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-white/5 ${className}`}
      >
        <MessageSquare className="w-4 h-4 text-black" />
        <span>CHAT ELON MUSK</span>
        <ArrowRight className="w-4 h-4 text-black" />
      </button>
    );
  }

  return (
    <div className={`w-full max-w-xl mx-auto ${className}`}>
      <button
        onClick={onClick}
        className="w-full group relative overflow-hidden bg-white hover:bg-neutral-100 text-black py-4 sm:py-5 px-6 sm:px-8 rounded-2xl font-black text-base sm:text-xl tracking-wider uppercase transition-all duration-200 active:scale-[0.98] shadow-2xl shadow-white/10 flex items-center justify-between border-2 border-white"
        aria-label="Open Chat Elon Musk and Community Messaging"
      >
        <div className="flex items-center gap-3 sm:gap-4 text-left">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="text-black font-black text-lg sm:text-2xl tracking-tight leading-none">
              CHAT ELON MUSK
            </div>
            {showSubtitle && (
              <p className="text-neutral-600 text-xs sm:text-sm font-medium tracking-normal mt-1 normal-case">
                Connect with the Space Community & Verified Desk
              </p>
            )}
          </div>
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center shrink-0">
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </button>
    </div>
  );
};
