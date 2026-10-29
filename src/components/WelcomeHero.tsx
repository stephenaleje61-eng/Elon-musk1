import React from 'react';
import { LargeChatButton } from './LargeChatButton';
import { 
  Rocket, 
  Car, 
  TrendingUp, 
  ShieldAlert, 
  ArrowUpRight, 
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';

interface WelcomeHeroProps {
  onEnterSpace: () => void;
  onExploreTesla: () => void;
  onExploreInvestment: () => void;
  onChatElonMusk: () => void;
  onExploreScamRecovery: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onEnterSpace,
  onExploreTesla,
  onExploreInvestment,
  onChatElonMusk,
  onExploreScamRecovery,
}) => {
  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-black text-white">
      {/* Background Space Imagery with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/space_hero_launch_1793254068348.jpg"
          alt="Heavy Orbital Rocket Launching to Cosmic Orbit"
          className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-black/30 to-black" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Subtle international platform header */}
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 mb-6 bg-neutral-900/80 px-4 py-1.5 rounded-full border border-neutral-800">
          <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
          <span>Interplanetary Exploration & Electric Mobility</span>
        </div>

        {/* Brand Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[1.05] text-balance max-w-4xl">
          ELON MUSK SPACE
        </h1>

        {/* Tagline */}
        <p className="mt-5 text-lg sm:text-2xl md:text-3xl text-neutral-300 font-light tracking-wide max-w-3xl text-balance">
          “Explore Space. Discover Technology. Connect with the Future.”
        </p>

        {/* Free access notice */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-400 font-medium">
          <Lock className="w-3.5 h-3.5 text-neutral-500" />
          <span>Free Open Access · No Email, Password, or Subscription Required</span>
        </div>

        {/* Primary Action Zone: CHAT ELON MUSK (Large White Button) */}
        <div className="mt-10 w-full max-w-xl">
          <LargeChatButton
            onClick={onChatElonMusk}
            showSubtitle={true}
          />
        </div>

        {/* Secondary Action Buttons Grid */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-2xl">
          <button
            onClick={onEnterSpace}
            className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl border border-neutral-700 hover:border-white transition-all active:scale-95 flex items-center gap-2"
          >
            <Rocket className="w-4 h-4 text-neutral-300" />
            <span>ENTER ELON MUSK SPACE</span>
          </button>

          <button
            onClick={onExploreTesla}
            className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl border border-neutral-700 hover:border-white transition-all active:scale-95 flex items-center gap-2"
          >
            <Car className="w-4 h-4 text-neutral-300" />
            <span>EXPLORE TESLA</span>
          </button>

          <button
            onClick={onExploreInvestment}
            className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl border border-neutral-700 hover:border-white transition-all active:scale-95 flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-neutral-300" />
            <span>EXPLORE INVESTMENT</span>
          </button>
        </div>

        {/* Pillar Highlight Strip */}
        <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          
          <div 
            onClick={onExploreScamRecovery}
            className="cursor-pointer p-4 bg-neutral-950/80 hover:bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all group"
          >
            <div className="flex items-center justify-between text-neutral-400 group-hover:text-white mb-2">
              <ShieldAlert className="w-5 h-5 text-neutral-300" />
              <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-tight">Recovery Desk</div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-2">Report fraud, track case status & secure official guidance</div>
          </div>

          <div 
            onClick={onExploreTesla}
            className="cursor-pointer p-4 bg-neutral-950/80 hover:bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all group"
          >
            <div className="flex items-center justify-between text-neutral-400 group-hover:text-white mb-2">
              <Car className="w-5 h-5 text-neutral-300" />
              <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-tight">Tesla Showroom</div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-2">Model S, Cybertruck, Roadster specs, range & pricing</div>
          </div>

          <div 
            onClick={onEnterSpace}
            className="cursor-pointer p-4 bg-neutral-950/80 hover:bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all group"
          >
            <div className="flex items-center justify-between text-neutral-400 group-hover:text-white mb-2">
              <TrendingUp className="w-5 h-5 text-neutral-300" />
              <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-tight">Market Intelligence</div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-2">TSLA stock charts, financial fundamentals & verified indexes</div>
          </div>

          <div 
            onClick={onExploreInvestment}
            className="cursor-pointer p-4 bg-neutral-950/80 hover:bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all group"
          >
            <div className="flex items-center justify-between text-neutral-400 group-hover:text-white mb-2">
              <Rocket className="w-5 h-5 text-neutral-300" />
              <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-tight">Investment Hub</div>
            <div className="text-xs text-neutral-400 mt-1 line-clamp-2">Compound calculator, risk analysis & fraud prevention</div>
          </div>

        </div>

      </div>

      {/* Bottom Legal Transparency Banner */}
      <div className="relative z-10 w-full border-t border-neutral-900 bg-black/90 py-3 px-4 text-center text-[11px] text-neutral-500">
        <p>
          Elon Musk Space is an independent technological information and community platform. No endorsement or direct fund management by Elon Musk or Tesla Inc is implied.
        </p>
      </div>
    </div>
  );
};
