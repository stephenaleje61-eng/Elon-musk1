import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const AuthenticityNotice: React.FC = () => {
  return (
    <div className="bg-[#18191a] border-b border-[#2d2e30] py-2.5 px-4 text-xs text-neutral-300">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-snug text-[11px] sm:text-xs">
          <strong className="text-white font-semibold">Authenticity Notice:</strong> This is a fan community for Elon Musk & SpaceX enthusiasts. This is <span className="underline font-bold text-white">NOT</span> the official Elon Musk account and is not affiliated with Elon Musk, Tesla, or SpaceX. Only community admins manage this space. No one here will ever request cryptocurrency, seed phrases, or wire deposits.
        </p>
      </div>
    </div>
  );
};
