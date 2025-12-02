import { useState, useEffect } from 'react';
import { Toaster } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { Dashboard } from './pages/Dashboard';
import { Games } from './pages/Games';
import { Players } from './pages/Players';
import { Settings } from './pages/Settings';
import { Activities } from './pages/Activities';
import { PasswordAccess } from './pages/PasswordAccess';
import { CompleteReset } from './pages/CompleteReset';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStore } from './lib/store';
import { useOnlineStatus } from './lib/offline';
import { checkBackupReminder } from './lib/backup-reminder';
import { Home, Gamepad2, Users, SettingsIcon, Calendar, Loader2, WifiOff } from 'lucide-react';
import { cn } from './lib/utils';

type Page = 'dashboard' | 'games' | 'players' | 'activities' | 'settings' | 'reset';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { hasAccess, setAccess, syncFromServer, initializeData, isLoading, setLoading } = useStore();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const isOnline = useOnlineStatus();
  
  // Always require password on app load - no persistence
  useEffect(() => {
    setInitialCheckDone(true);
  }, []);

  // Force dark mode only
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);

  // Register service worker for PWA
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      const timer = setTimeout(() => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('✅ Service Worker registered successfully:', registration.scope);
          })
          .catch((error) => {
            // Log but don't break - service worker is optional
            console.log('ℹ️ Service Worker not available:', error.message);
          });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccessGranted = async () => {
    setAccess(true);
    setLoading(true);
    
    try {
      // Initialize data if needed
      await initializeData();
      // Sync data from server
      await syncFromServer();
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigateToActivities={() => setCurrentPage('activities')} />;
      case 'games':
        return <Games />;
      case 'players':
        return <Players />;
      case 'activities':
        return <Activities />;
      case 'settings':
        return <Settings />;
      case 'reset':
        return <CompleteReset />;
      default:
        return <Dashboard onNavigateToActivities={() => setCurrentPage('activities')} />;
    }
  };

  if (!initialCheckDone) {
    return (
      <div className="min-h-screen bg-[#172033] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-[#0ea5e9] mx-auto mb-4" />
          </motion.div>
          <p className="text-[#f1f5f9]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#172033]">
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-10 h-10 text-[#0ea5e9] mx-auto mb-4" />
            </motion.div>
            <p className="text-[#f1f5f9]">Loading...</p>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      {!hasAccess ? (
        <PasswordAccess onAccessGranted={handleAccessGranted} />
      ) : (
        <>
          <main className="pb-24 relative z-10">
            <ErrorBoundary>
              {renderPage()}
            </ErrorBoundary>
          </main>
          
          {/* Modern Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
              <div className="bg-[#192234] border border-[#2A3344] rounded-[24px] shadow-lg shadow-black/20">
                <div className="flex items-center justify-around px-2 py-3">
                  <NavButton
                    icon={<Home className="w-5 h-5" />}
                    label="Home"
                    active={currentPage === 'dashboard'}
                    onClick={() => setCurrentPage('dashboard')}
                  />
                  <NavButton
                    icon={<Gamepad2 className="w-5 h-5" />}
                    label="Games"
                    active={currentPage === 'games'}
                    onClick={() => setCurrentPage('games')}
                  />
                  <NavButton
                    icon={<Users className="w-5 h-5" />}
                    label="Players"
                    active={currentPage === 'players'}
                    onClick={() => setCurrentPage('players')}
                  />
                  <NavButton
                    icon={<Calendar className="w-5 h-5" />}
                    label="Activity"
                    active={currentPage === 'activities'}
                    onClick={() => setCurrentPage('activities')}
                  />
                  <NavButton
                    icon={<SettingsIcon className="w-5 h-5" />}
                    label="Settings"
                    active={currentPage === 'settings'}
                    onClick={() => setCurrentPage('settings')}
                  />
                </div>
              </div>
            </div>
          </nav>
        </>
      )}
      
      {/* Toast Notifications */}
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex flex-col items-center gap-1 px-4 py-2 rounded-[18px] transition-all duration-200 min-w-[64px]',
        'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#172033]',
        active
          ? 'text-white'
          : 'text-slate-400 hover:text-white'
      )}
    >
      {/* Active indicator background - solid cyan */}
      {active && (
        <div
          className="absolute inset-0 bg-[#0ea5e9] rounded-[18px]"
          aria-hidden="true"
        />
      )}
      
      {/* Icon and label */}
      <div className={cn(
        'relative z-10 transition-transform duration-200',
        active && 'scale-110'
      )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <span className={cn(
        'relative z-10 text-[10px] font-medium transition-opacity duration-200',
        active ? 'opacity-100' : 'opacity-70'
      )}>
        {label}
      </span>
    </button>
  );
}