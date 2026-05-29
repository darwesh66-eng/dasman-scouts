import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

type Page = string;

const NAV_LINKS = [
  { page: 'home', ar: 'الرئيسية', en: 'Home' },
  { page: 'about', ar: 'عن المجموعة', en: 'About' },
  { page: 'groups', ar: 'الفرق', en: 'Groups' },
  { page: 'leaders', ar: 'القادة', en: 'Leaders' },
  { page: 'news', ar: 'الأخبار', en: 'News' },
  { page: 'gallery', ar: 'المعرض', en: 'Gallery' },
  { page: 'archive', ar: 'الأرشيف', en: 'Archive' },
  { page: 'calendar', ar: 'الفعاليات', en: 'Events' },
  { page: 'achievements', ar: 'الإنجازات', en: 'Achievements' },
  { page: 'join', ar: '⚜️ انضم إلينا', en: '⚜️ Join Us' },
];

interface Props {
  currentPage: Page;
  setPage: (p: Page) => void;
  onSearch: () => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

export default function Navbar({ currentPage, setPage, onSearch, darkMode = false, onToggleDark }: Props) {
  const { data, lang, setLang, isAdmin, t } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { logoSettings, siteName } = data;
  const logoSrc = logoSettings.url;

  const shapeRadius =
    logoSettings.shape === 'circle' ? '50%'
    : logoSettings.shape === 'rounded' ? '14px'
    : '0px';

  // Hero-aware: transparent on home hero, solid white when scrolled / on other pages
  const onHero = !scrolled && currentPage === 'home';
  const navBg = onHero ? 'transparent' : scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.96)';
  const logoColor   = onHero ? '#fff' : 'var(--primary)';
  const subtitleClr = onHero ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)';
  const linkClr     = onHero ? 'rgba(255,255,255,0.88)' : 'var(--text)';
  const activeLinkClr = onHero ? '#fff' : 'var(--primary)';
  const activeLinkBg  = onHero ? 'rgba(255,255,255,0.14)' : 'var(--primary-light)';
  const borderClr   = onHero ? 'rgba(255,255,255,0.28)' : 'var(--border)';
  const searchBg    = onHero ? 'rgba(255,255,255,0.1)' : 'var(--surface-2)';
  const kbdBg       = onHero ? 'rgba(255,255,255,0.15)' : 'var(--border)';
  const hamburgClr  = onHero ? '#fff' : 'var(--text)';

  return (
    <nav
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-h)',
        zIndex: 700,
        background: navBg,
        backdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(27,58,107,0.08)' : 'none',
        transition: 'background 0.45s cubic-bezier(0.4,0,0.2,1), box-shadow 0.45s ease, border-color 0.45s ease',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 20,
      }}
    >
      {/* Logo + Name */}
      <button
        onClick={() => setPage('home')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}
      >
        {logoSettings.showInNav && logoSrc && (
          <div style={{
            width: logoSettings.navSize, height: logoSettings.navSize,
            borderRadius: shapeRadius, overflow: 'hidden', flexShrink: 0,
          }}>
            <img
              src={logoSrc}
              alt="Logo"
              style={{ width: `${logoSettings.innerScale}%`, height: `${logoSettings.innerScale}%`, objectFit: 'cover' }}
            />
          </div>
        )}
        <div style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <div style={{
            fontSize: 16, fontWeight: 800, color: logoColor,
            fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif',
            lineHeight: 1.2, transition: 'color 0.45s',
          }}>
            {lang === 'ar' ? siteName.ar : siteName.en}
          </div>
          {siteName.subtitle && (
            <div style={{ fontSize: 11, color: subtitleClr, fontFamily: 'Jost,sans-serif', marginTop: 1, transition: 'color 0.45s' }}>
              {siteName.subtitle}
            </div>
          )}
        </div>
      </button>

      {/* Desktop nav links */}
      <div style={{ alignItems: 'center', gap: 4, flex: 1, overflowX: 'auto' }} className="hidden lg:flex">
        {NAV_LINKS.map((link) => (
          <button
            key={link.page}
            onClick={() => setPage(link.page)}
            style={{
              position: 'relative',
              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: currentPage === link.page ? 700 : 500,
              fontFamily: 'Cairo,sans-serif', whiteSpace: 'nowrap',
              background: currentPage === link.page ? activeLinkBg : 'none',
              color: currentPage === link.page ? activeLinkClr : linkClr,
              transition: 'all 0.3s',
            }}
          >
            {lang === 'ar' ? link.ar : link.en}
            {/* Active dot indicator */}
            {currentPage === link.page && (
              <span style={{
                position: 'absolute', bottom: 3, left: '50%',
                transform: 'translateX(-50%)',
                width: 4, height: 4, borderRadius: '50%',
                background: onHero ? '#fff' : 'var(--secondary)',
                display: 'block',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginInlineStart: 'auto', flexShrink: 0 }}>
        {/* Search */}
        <button
          onClick={onSearch}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 10, border: `1px solid ${borderClr}`, background: searchBg,
            color: onHero ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'Jost,sans-serif',
            transition: 'all 0.3s',
          }}
        >
          <span>🔍</span>
          <kbd style={{ fontSize: 11, background: kbdBg, padding: '1px 5px', borderRadius: 4, transition: 'background 0.3s' }}>⌘K</kbd>
        </button>

        {/* Dark mode toggle */}
        {onToggleDark && (
          <button
            onClick={onToggleDark}
            title={darkMode ? 'Light mode' : 'Dark mode'}
            style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${borderClr}`,
              background: onHero ? 'rgba(255,255,255,0.1)' : 'var(--surface-2)',
              cursor: 'pointer', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        )}

        {/* Lang toggle */}
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          style={{
            padding: '6px 14px', borderRadius: 10, border: `1px solid ${borderClr}`,
            background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: onHero ? '#fff' : 'var(--primary)', fontFamily: 'Jost,sans-serif',
            transition: 'all 0.3s',
          }}
        >
          {lang === 'ar' ? 'EN' : 'عر'}
        </button>

        {/* Admin button */}
        <button
          onClick={() => setPage(isAdmin ? 'admin' : 'login')}
          style={{
            padding: '7px 16px', borderRadius: 10,
            border: onHero ? '1px solid rgba(255,255,255,0.4)' : 'none',
            background: onHero ? 'rgba(255,255,255,0.16)' : isAdmin ? 'var(--secondary)' : 'var(--primary)',
            color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            fontFamily: 'Cairo,sans-serif', whiteSpace: 'nowrap', transition: 'all 0.3s',
          }}
        >
          {isAdmin ? t('لوحة التحكم', 'Dashboard') : t('تسجيل الدخول', 'Admin')}
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            padding: '6px', border: 'none',
            background: 'none', cursor: 'pointer', color: hamburgClr, transition: 'color 0.3s',
          }}
          className="block lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute', top: 'var(--nav-h)', left: 0, right: 0,
            background: 'var(--surface)', borderBottom: '1px solid var(--border)',
            padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4,
            boxShadow: '0 8px 32px rgba(27,58,107,0.1)', zIndex: 700,
          }}
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.page}
              onClick={() => { setPage(link.page); setMobileOpen(false); }}
              style={{
                padding: '10px 14px', borderRadius: 10, border: 'none',
                textAlign: lang === 'ar' ? 'right' : 'left', cursor: 'pointer',
                fontSize: 15, fontWeight: currentPage === link.page ? 700 : 400,
                fontFamily: 'Cairo,sans-serif',
                background: currentPage === link.page ? 'var(--primary-light)' : 'none',
                color: currentPage === link.page ? 'var(--primary)' : 'var(--text)',
              }}
            >
              {lang === 'ar' ? link.ar : link.en}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
