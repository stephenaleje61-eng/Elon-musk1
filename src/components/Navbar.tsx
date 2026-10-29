import React, { useState } from 'react';
import { LargeChatButton } from './LargeChatButton';
import { User, Menu, X, ShieldAlert, Car, TrendingUp, DollarSign, MessageSquare, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenAdmin,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'scam-recovery', label: 'Recovery Desk' },
    { id: 'tesla-cars', label: 'Tesla Fleet' },
    { id: 'shares-market', label: 'Stock & Market' },
    { id: 'investment-centre', label: 'Investment Hub' },
    { id: 'private-chat', label: 'Chat Centre' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-900 w-full transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3.5">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNavClick('welcome')}
          className="text-lg sm:text-xl font-black tracking-widest text-white uppercase whitespace-nowrap shrink-0 hover:text-neutral-300 transition-colors flex items-center gap-2 text-left"
        >
          <span>ELON MUSK SPACE</span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-neutral-400">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === item.id
                  ? 'text-white border-white font-semibold'
                  : 'border-transparent hover:text-white hover:border-neutral-700'
              }`}
            >
              {item.label}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap text-xs font-mono border border-neutral-800 px-2 py-0.5 rounded"
            >
              <Lock className="w-3 h-3 text-neutral-400" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <LargeChatButton
            variant="nav"
            onClick={() => handleNavClick('private-chat')}
            className="hidden sm:flex"
          />

          <button
            onClick={onOpenProfile}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-white transition-colors flex items-center gap-2 text-xs"
            title="Account Profile"
            aria-label="User Account"
          >
            <User className="w-4 h-4 text-neutral-300" />
            <span className="hidden md:inline max-w-[100px] truncate text-neutral-300">
              {profile?.displayName || (user ? 'Account' : 'Enter')}
            </span>
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-2">Navigation</div>
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleNavClick('welcome')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'welcome' ? 'bg-white text-black' : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              Welcome Space
            </button>
            <button
              onClick={() => handleNavClick('scam-recovery')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'scam-recovery' ? 'bg-white text-black' : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-neutral-400" />
              Scam Money Recovery Centre
            </button>
            <button
              onClick={() => handleNavClick('tesla-cars')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'tesla-cars' ? 'bg-white text-black' : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <Car className="w-4 h-4 text-neutral-400" />
              Tesla Showroom & Fleet
            </button>
            <button
              onClick={() => handleNavClick('shares-market')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'shares-market' ? 'bg-white text-black' : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-neutral-400" />
              Company Shares & Market
            </button>
            <button
              onClick={() => handleNavClick('investment-centre')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'investment-centre' ? 'bg-white text-black' : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <DollarSign className="w-4 h-4 text-neutral-400" />
              Investment Education Hub
            </button>
            <button
              onClick={() => handleNavClick('private-chat')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${
                activeTab === 'private-chat' ? 'bg-white text-black' : 'text-neutral-300 hover:bg-neutral-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-neutral-400" />
              Private Chat Centre
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-900 space-y-2">
            <button
              onClick={() => { handleNavClick('private-chat'); }}
              className="w-full py-3 bg-white text-black font-extrabold text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT ELON MUSK</span>
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
                className="flex-1 py-2.5 bg-neutral-900 text-neutral-300 rounded-lg text-xs font-semibold hover:bg-neutral-800 border border-neutral-800"
              >
                Profile & Settings
              </button>
              {isAdmin && (
                <button
                  onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                  className="py-2.5 px-3 bg-neutral-900 text-neutral-300 rounded-lg text-xs font-mono hover:bg-neutral-800 border border-neutral-800"
                >
                  Admin Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
