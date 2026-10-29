import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { testFirestoreConnection } from './firebase/config';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WelcomeHero } from './components/WelcomeHero';
import { ScamRecoveryCentre } from './components/ScamRecoveryCentre';
import { TeslaShowroom } from './components/TeslaShowroom';
import { CompanyShares } from './components/CompanyShares';
import { InvestmentCentre } from './components/InvestmentCentre';
import { PrivateChatCentre } from './components/PrivateChatCentre';
import { ProfileModal } from './components/ProfileModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LargeChatButton } from './components/LargeChatButton';
import { ArrowUpRight, MessageSquare, ShieldAlert, Car, TrendingUp, DollarSign } from 'lucide-react';

function AppContent() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('welcome');
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Validate connection to Firestore on boot per Firebase guidelines
    testFirestoreConnection().catch(console.warn);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'welcome' && (
          <div>
            <WelcomeHero
              onEnterSpace={() => handleTabChange('scam-recovery')}
              onExploreTesla={() => handleTabChange('tesla-cars')}
              onExploreInvestment={() => handleTabChange('investment-centre')}
              onChatElonMusk={() => handleTabChange('private-chat')}
              onExploreScamRecovery={() => handleTabChange('scam-recovery')}
            />

            {/* Quick Feature Bento Strip on Welcome Page */}
            <section className="bg-black py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-neutral-900">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                    Integrated Ecosystem
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
                    Five Core Pillars of Technology & Protection
                  </h2>
                </div>
                <div className="w-full sm:w-auto">
                  <LargeChatButton
                    variant="compact"
                    onClick={() => handleTabChange('private-chat')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card 1: Scam Recovery */}
                <div
                  onClick={() => handleTabChange('scam-recovery')}
                  className="bg-neutral-950 border border-neutral-900 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                        <ShieldAlert className="w-5 h-5 text-neutral-300" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      Scam Money Recovery Centre
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Incident intake forms, transaction evidence uploads, official 72-hour banking dispute protocols, and real-time case tracking.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-900 text-xs font-semibold text-white flex items-center gap-1">
                    <span>File or Track Docket</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Card 2: Tesla Showroom */}
                <div
                  onClick={() => handleTabChange('tesla-cars')}
                  className="bg-neutral-950 border border-neutral-900 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                        <Car className="w-5 h-5 text-neutral-300" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      Tesla Fleet Showroom
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Model S Plaid, Cybertruck Cyberbeast, Roadster, interactive specs comparison, multi-currency conversion, and direct official Tesla links.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-900 text-xs font-semibold text-white flex items-center gap-1">
                    <span>Explore Fleet</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Card 3: Company Shares */}
                <div
                  onClick={() => handleTabChange('shares-market')}
                  className="bg-neutral-950 border border-neutral-900 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                        <TrendingUp className="w-5 h-5 text-neutral-300" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      Company Shares & Market Data
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      TSLA delayed market metrics, normalized historical trend charts, customizable personal securities watchlist, and capital risk disclosures.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-900 text-xs font-semibold text-white flex items-center gap-1">
                    <span>Inspect Market</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Card 4: Investment Hub */}
                <div
                  onClick={() => handleTabChange('investment-centre')}
                  className="bg-neutral-950 border border-neutral-900 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                        <DollarSign className="w-5 h-5 text-neutral-300" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      Investment Education Centre
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Interactive compound growth calculator, goal milestone reverse-solver, curriculum on asset diversification, and scam defense.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-900 text-xs font-semibold text-white flex items-center gap-1">
                    <span>Calculate Compound Yield</span>
                    <span>→</span>
                  </div>
                </div>

                {/* Card 5: Private Chat Centre */}
                <div
                  onClick={() => handleTabChange('private-chat')}
                  className="md:col-span-2 bg-neutral-950 border border-neutral-900 hover:border-neutral-700 rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-black" />
                      </div>
                      <span className="text-xs bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded font-mono border border-neutral-800">
                        Peer-to-Peer
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      Private Chat Centre & Community Desk
                    </h3>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Secure one-to-one communications between authenticated sessions. Text messages, image uploads, emoji support, unread indicators, and safety report integration.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-900 text-xs font-semibold text-white flex items-center gap-1">
                    <span>Launch Messaging Channel</span>
                    <span>→</span>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {activeTab === 'scam-recovery' && <ScamRecoveryCentre />}
        {activeTab === 'tesla-cars' && <TeslaShowroom />}
        {activeTab === 'shares-market' && <CompanyShares />}
        {activeTab === 'investment-centre' && <InvestmentCentre />}
        {activeTab === 'private-chat' && <PrivateChatCentre />}
      </main>

      {/* Global Call to Action Strip (Shown when not in chat or welcome) */}
      {activeTab !== 'welcome' && activeTab !== 'private-chat' && (
        <section className="bg-neutral-950 border-t border-neutral-900 py-10 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
              Have Questions or Need Direct Peer Assistance?
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Open the dedicated messaging centre to converse with authorized community members or the verified assistance desk.
            </p>
            <LargeChatButton
              onClick={() => handleTabChange('private-chat')}
              className="mt-2"
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer
        onNavClick={handleTabChange}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Modals */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <AdminDashboard
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
