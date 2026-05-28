import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import WhatsAppButton from '@/components/WhatsAppButton';
import ScrollToTop from '@/components/ScrollToTop';
import SplashScreen from '@/components/SplashScreen';
import SearchModal from '@/components/SearchModal';
import ScrollProgress from '@/components/ScrollProgress';
import WelcomeModal from '@/components/WelcomeModal';
import { trackPageView } from '@/lib/analytics';

// Lazy-loaded pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const GroupsPage = lazy(() => import('@/pages/GroupsPage'));
const LeadersPage = lazy(() => import('@/pages/LeadersPage'));
const NewsPage = lazy(() => import('@/pages/NewsPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const ArchivePage = lazy(() => import('@/pages/ArchivePage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const JoinPage = lazy(() => import('@/pages/JoinPage'));

// Valid hash-based pages
const VALID_PAGES = [
  'home', 'about', 'groups', 'leaders', 'news',
  'gallery', 'archive', 'login', 'admin', 'calendar', 'achievements', 'join',
] as const;

type Page = typeof VALID_PAGES[number];

function getInitialPage(): Page {
  const hash = window.location.hash.replace('#', '').toLowerCase() as Page;
  return VALID_PAGES.includes(hash) ? hash : 'home';
}

function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '3px solid var(--primary-light)',
        borderTopColor: 'var(--primary)',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

export default function App() {
  const { firebaseReady, isAdmin, t, data } = useApp();
  const [page, setPageState] = useState<Page>(getInitialPage);
  const [splashDone, setSplashDone] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dasman_darkmode') === '1');

  // Apply / remove dark class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('dasman_darkmode', darkMode ? '1' : '0');
  }, [darkMode]);

  // Track page views for analytics
  useEffect(() => {
    trackPageView(page);
  }, [page]);

  // Welcome popup logic
  useEffect(() => {
    const wp = data.welcomePopup;
    if (!wp.enabled) return;
    if (wp.showOnce && sessionStorage.getItem('dasman_welcome_shown')) return;
    const timer = setTimeout(() => {
      setShowWelcome(true);
      if (wp.showOnce) sessionStorage.setItem('dasman_welcome_shown', '1');
    }, wp.delayMs);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.welcomePopup.enabled, data.welcomePopup.delayMs]);

  // Hash-based navigation
  const setPage = useCallback((p: string) => {
    const newPage = VALID_PAGES.includes(p as Page) ? (p as Page) : 'home';
    setPageState(newPage);
    window.location.hash = newPage;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase() as Page;
      const valid = VALID_PAGES.includes(hash) ? hash : 'home';
      setPageState(valid);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Ctrl+K / Cmd+K opens search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Register PWA service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => { /* ignore in dev */ });
    }
  }, []);

  const isAdminPage = page === 'admin';

  // Render the active page
  const renderPage = () => {
    switch (page) {
      case 'home':         return <HomePage setPage={setPage} />;
      case 'about':        return <AboutPage />;
      case 'groups':       return <GroupsPage />;
      case 'leaders':      return <LeadersPage />;
      case 'news':         return <NewsPage />;
      case 'gallery':      return <GalleryPage />;
      case 'archive':      return <ArchivePage />;
      case 'calendar':     return <CalendarPage />;
      case 'achievements': return <AchievementsPage />;
      case 'join':         return <JoinPage setPage={setPage} />;
      case 'login':        return <LoginPage setPage={setPage} />;
      case 'admin':        return isAdmin ? <AdminPage setPage={setPage} /> : <LoginPage setPage={setPage} />;
      default:             return <HomePage setPage={setPage} />;
    }
  };

  return (
    <>
      {/* Scroll progress bar */}
      <ScrollProgress />

      {/* Splash screen */}
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      {/* Firebase loading overlay */}
      {!firebaseReady && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'var(--primary)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Cairo,sans-serif', fontSize: 14 }}>
            {t('جاري التحميل...', 'Loading...')}
          </div>
        </div>
      )}

      {/* Navbar */}
      {!isAdminPage && (
        <Navbar
          currentPage={page}
          setPage={setPage}
          onSearch={() => setSearchOpen(true)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
        />
      )}

      {/* Page content with enter animation */}
      <Suspense fallback={<PageLoader />}>
        <div key={page} className="page-enter">
          {renderPage()}
        </div>
      </Suspense>

      {/* Footer */}
      {!isAdminPage && <Footer setPage={setPage} />}

      {/* Mobile bottom nav */}
      {!isAdminPage && <BottomNav currentPage={page} setPage={setPage} />}

      {/* Floating elements */}
      {!isAdminPage && <WhatsAppButton />}
      {!isAdminPage && <ScrollToTop />}

      {/* Search modal */}
      {searchOpen && (
        <SearchModal
          onClose={() => setSearchOpen(false)}
          setPage={(p) => { setPage(p); setSearchOpen(false); }}
        />
      )}

      {/* Welcome popup */}
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
    </>
  );
}
