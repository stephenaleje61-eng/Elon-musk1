import React, { useState } from 'react';
import { ShieldCheck, Lock, ExternalLink, X, FileText } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick, onOpenAdmin }) => {
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | 'security' | null>(null);

  return (
    <footer className="bg-black border-t border-neutral-900 text-neutral-400 text-xs py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <span className="text-sm font-black text-white tracking-widest uppercase block">
              ELON MUSK SPACE
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Explore Space. Discover Technology. Connect with the Future. A premium platform dedicated to orbital flight, electric mobility, and cyber security literacy.
            </p>
            <div className="pt-2 text-[11px] text-neutral-500 font-mono">
              Independent Technology Platform
            </div>
          </div>

          {/* Core Modules */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Platform Wings
            </span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => onNavClick('scam-recovery')} className="hover:text-white transition-colors">
                  Scam Money Recovery Centre
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('tesla-cars')} className="hover:text-white transition-colors">
                  Tesla Showroom & Specifications
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('shares-market')} className="hover:text-white transition-colors">
                  Company Shares & Market Data
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('investment-centre')} className="hover:text-white transition-colors">
                  Investment Education Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavClick('private-chat')} className="hover:text-white transition-colors">
                  Private Chat Centre
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Transparency & Legal
            </span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setLegalModal('security')} className="hover:text-white transition-colors text-left">
                  Security Mandate & Anti-Scam Rules
                </button>
              </li>
              <li>
                <button onClick={() => setLegalModal('terms')} className="hover:text-white transition-colors text-left">
                  Terms of Service & Disclaimers
                </button>
              </li>
              <li>
                <button onClick={() => setLegalModal('privacy')} className="hover:text-white transition-colors text-left">
                  Privacy Policy & Data Rights
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-white transition-colors text-left font-mono text-[11px]">
                  Owner Portal & Administration
                </button>
              </li>
            </ul>
          </div>

          {/* Official Verification Notice */}
          <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-900">
            <div className="flex items-center gap-1.5 text-white font-bold text-xs uppercase">
              <ShieldCheck className="w-4 h-4 text-neutral-300" />
              <span>International Compliance</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              This service operates internationally. We adhere to global consumer protection guidelines and report criminal fraud dockets to verified international law enforcement entities.
            </p>
          </div>

        </div>

        {/* Bottom Disclaimers */}
        <div className="pt-6 border-t border-neutral-900 text-[11px] text-neutral-500 space-y-2 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} ELON MUSK SPACE. All rights reserved. This website is an independent educational and technological demonstration and reporting platform. It is not an official branch, subsidiary, or investment fund of Tesla, Inc. or SpaceX. All trademarks and model names remain the property of their respective holders.
          </p>
          <p>
            Never disclose your seed phrases, bank passwords, or one-time verification codes to anyone online.
          </p>
        </div>

      </div>

      {/* LEGAL MODALS */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                {legalModal === 'terms' && 'Terms of Service'}
                {legalModal === 'privacy' && 'Privacy Policy'}
                {legalModal === 'security' && 'Security Mandate'}
              </h3>
              <button
                onClick={() => setLegalModal(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-300 space-y-3 leading-relaxed">
              {legalModal === 'terms' && (
                <>
                  <p>
                    1. <strong>Independent Nature:</strong> Elon Musk Space operates as an independent technological analysis, automotive showcase, and cybercrime reporting resource.
                  </p>
                  <p>
                    2. <strong>No Financial Advice:</strong> Content presented in the Investment Centre and Company Shares sections is solely for educational and simulation purposes and does not constitute registered investment advice.
                  </p>
                  <p>
                    3. <strong>No Guaranteed Recovery:</strong> Submissions to the Scam Money Recovery Centre do not constitute a legal guarantee of fund retrieval. We facilitate documentation and official reporting pathways.
                  </p>
                </>
              )}

              {legalModal === 'privacy' && (
                <>
                  <p>
                    1. <strong>Anonymous Session Architecture:</strong> Users are welcomed without demanding compulsory email or password registrations. Session identifiers are anonymously generated.
                  </p>
                  <p>
                    2. <strong>Incident Data Confidentiality:</strong> Evidence documents and scam details submitted via the recovery docket are encrypted and accessed only by authorized compliance personnel.
                  </p>
                  <p>
                    3. <strong>Data Minimization:</strong> We do not track or profile user identity based on race, religion, nationality, or physical appearance.
                  </p>
                </>
              )}

              {legalModal === 'security' && (
                <>
                  <p>
                    1. <strong>Zero-Trust Credential Standard:</strong> We will never ask for your private cryptographic keys, mnemonic recovery seed phrases, bank card PINs, or SMS OTP codes.
                  </p>
                  <p>
                    2. <strong>No Celebrity Deposit Requests:</strong> Neither Elon Musk, Tesla executives, nor SpaceX personnel will solicit direct deposits or crypto transfers.
                  </p>
                  <p>
                    3. <strong>Secondary Scam Defense:</strong> Beware of fake "recovery agents" demanding upfront fees on social apps to retrieve lost crypto. Always report directly to official law enforcement agencies.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 bg-white text-black font-bold uppercase text-xs rounded-xl hover:bg-neutral-200"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
