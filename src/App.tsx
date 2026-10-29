import React, { useState, useEffect } from 'react';
import { AuthenticityNotice } from './components/AuthenticityNotice';
import { VisitorLanding } from './components/VisitorLanding';
import { AdminControl } from './components/AdminControl';

export default function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    return window.location.pathname.startsWith('/admin') || 
           window.location.hash === '#admin' || 
           new URLSearchParams(window.location.search).get('view') === 'admin';
  });

  // Keep title, URL, and search engine privacy in sync
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    if (isAdminView) {
      document.title = "ELON MUSK SPACE - Admin Control";
      robotsMeta.content = 'noindex, nofollow';
      if (!window.location.pathname.startsWith('/admin') && window.location.hash !== '#admin') {
        window.history.replaceState(null, '', '#admin');
      }
    } else {
      document.title = "ELON MUSK SPACE - Community Network";
      robotsMeta.content = 'index, follow';
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', '/');
      }
    }
  }, [isAdminView]);

  // Listen to browser navigation popstate or hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const isNowAdmin = window.location.pathname.startsWith('/admin') || 
                          window.location.hash === '#admin' ||
                          new URLSearchParams(window.location.search).get('view') === 'admin';
      setIsAdminView(isNowAdmin);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-[#e4e6eb] flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* Pinned Authenticity Notice at TOP OF EVERY PAGE */}
      <AuthenticityNotice />

      {/* Main View Router */}
      <div className="flex-1 flex flex-col">
        {isAdminView ? (
          <AdminControl onBackToVisitor={() => {
            window.location.hash = '';
            setIsAdminView(false);
          }} />
        ) : (
          <VisitorLanding />
        )}
      </div>

      {/* Discreet Footer (Admin link removed from public homepage per requirements) */}
      <footer className="bg-[#18191a] border-t border-[#2d2e30] py-4 px-4 text-center text-[11px] text-[#8a8d91]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} ELON MUSK SPACE · Fan Community Network</span>
          <div className="flex items-center gap-4 text-[10px]">
            <span>Encrypted Member Communications</span>
            {isAdminView && (
              <button
                onClick={() => {
                  window.location.hash = '';
                  setIsAdminView(false);
                }}
                className="hover:text-white transition-colors underline font-mono ml-2"
              >
                ← Return to Visitor Portal
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
