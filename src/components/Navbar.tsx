import React, { useState, useEffect, useRef } from 'react';
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
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      // Desktop hero-aware state
      setScrolled(current > 80);
      // Mobile hide-on-scroll: hide when scrolling down, show when scrolling up
      if (current <= 10) {
        setShowMobileNav(true);
      } else if (current > lastScrollY.current + 5) {
        setShowMobileNav(false);
      } else if (current < lastScrollY.current - 5) {
        setShowMobileNav(true);
      }
      lastScrollY.current = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
    <>
    {/* ═══════════════════════════════════════════════════════
        MOBILE HEADER — shown only on screens < lg (1024 px).
        Self-contained with inline styles. No CSS class deps.
        All 5 controls: hamburger | logo + title | theme | lang
        ═══════════════════════════════════════════════════════ */}
    <header
      className="mobile-nav-bar"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 52,
        zIndex: 800,
        background: 'var(--primary)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        /* display handled by .mobile-nav-bar CSS — no inline display so
           the media query can cleanly show/hide without !important fights */
        alignItems: 'center',
        gap: 6,
        padding: '0 10px',
        // Slides up when scrolling down, slides back when scrolling up
        transform: showMobileNav ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.28s ease',
      }}
    >
      {/* Start side: hamburger (right in AR, left in EN) */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={t('القائمة', 'Menu')}
        aria-expanded={mobileOpen}
        style={{
          flexShrink: 0, width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, border: '1px solid rgba(255,255,255,0.28)',
          background: 'rgba(255,255,255,0.12)',
          color: '#fff', cursor: 'pointer', padding: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          {mobileOpen ? (
            <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
          ) : (
            <><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></>
          )}
        </svg>
      </button>

      {/* Center: logo + full site title (fills remaining space, shrinks if needed) */}
      <button
        onClick={() => setPage('home')}
        style={{
          flex: 1, minWidth: 0,
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          overflow: 'hidden',
        }}
      >
        {logoSettings.showInNav && logoSrc && (
          <div style={{
            width: 26, height: 26, flexShrink: 0,
            borderRadius: shapeRadius, overflow: 'hidden',
          }}>
            <img src={logoSrc} alt="" style={{ width: `${logoSettings.innerScale}%`, height: `${logoSettings.innerScale}%`, objectFit: 'cover' }} />
          </div>
        )}
        <span style={{
          color: '#fff', fontWeight: 700, lineHeight: 1.2,
          fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif',
          fontSize: 'clamp(11px, 3.4vw, 14px)',
          whiteSpace: 'nowrap',
        }}>
          {lang === 'ar' ? siteName.ar : siteName.en}
        </span>
      </button>

      {/* End side: theme toggle + language switch */}
      {onToggleDark && (
        <button
          onClick={onToggleDark}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          style={{
            flexShrink: 0, width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.28)',
            background: 'rgba(255,255,255,0.12)',
            cursor: 'pointer', fontSize: 15,
          }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      )}
      <button
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        style={{
          flexShrink: 0, height: 34, padding: '0 10px',
          display: 'flex', alignItems: 'center',
          borderRadius: 8, border: '1px solid rgba(255,255,255,0.28)',
          background: 'rgba(255,255,255,0.12)',
          color: '#fff', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, fontFamily: 'Jost,sans-serif',
        }}
      >
        {lang === 'ar' ? 'EN' : 'عر'}
      </button>
    </header>

    {/* ═══════════════════════════════════════════════════════
        DESKTOP NAV — hidden on mobile via CSS (.navbar-row)
        ═══════════════════════════════════════════════════════ */}
    <nav
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="navbar-row"
      style={{
        /* position/top/left/right/height live in CSS so the mobile rule
           can switch from fixed → sticky without inline specificity fighting it */
        zIndex: 700,
        background: navBg,
        backdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(27,58,107,0.08)' : 'none',
        transition: 'background 0.45s cubic-bezier(0.4,0,0.2,1), box-shadow 0.45s ease, border-color 0.45s ease',
      }}
    >
      {/* Logo + Name — CENTER zone on mobile */}
      <button
        onClick={() => setPage('home')}
        className="nav-center"
        style={{ display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}
      >
        {logoSettings.showInNav && logoSrc && (
          <div className="nav-logo-box" style={{
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
        <div className="nav-title-wrap" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <div className="nav-title" style={{
            fontWeight: 800, color: logoColor,
            fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif',
            lineHeight: 1.2, transition: 'color 0.45s',
          }}>
            {lang === 'ar' ? siteName.ar : siteName.en}
          </div>
          {siteName.subtitle && (
            <div className="nav-subtitle" style={{ fontSize: 11, color: subtitleClr, fontFamily: 'Jost,sans-serif', marginTop: 1, transition: 'color 0.45s' }}>
              {siteName.subtitle}
            </div>
          )}
        </div>
      </button>

      {/* Mobile menu button — START zone. Grid places col 1 at the start side
          automatically (right in RTL, left in LTR), so no order hack needed. */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={t('القائمة', 'Menu')}
        aria-expanded={mobileOpen}
        className="flex lg:hidden nav-start"
        style={{
          width: 40, height: 40, flexShrink: 0,
          alignItems: 'center', justifyContent: 'center', padding: 0,
          borderRadius: 10, border: `1px solid ${borderClr}`,
          background: onHero ? 'rgba(255,255,255,0.14)' : 'var(--surface-2)',
          color: hamburgClr, cursor: 'pointer', transition: 'all 0.3s',
        }}
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

      {/* Right actions — END zone on mobile (language + theme) */}
      <div className="nav-end" style={{ display: 'flex', alignItems: 'center', gap: 8, marginInlineStart: 'auto', flexShrink: 0 }}>
        {/* Search — desktop only; mobile users use the drawer */}
        <button
          onClick={onSearch}
          className="hidden lg:flex"
          style={{
            alignItems: 'center', gap: 6, padding: '6px 12px',
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

        {/* Admin button — desktop only; mobile users use the drawer footer */}
        <button
          onClick={() => setPage(isAdmin ? 'admin' : 'login')}
          className="hidden lg:block"
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
      </div>
    </nav>

      {/* ───────── Mobile side drawer ───────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 1400, animation: 'fadeIn 0.2s ease',
            }}
          />
          {/* Drawer panel — slides in from the start side (right in RTL, left in LTR) */}
          <aside
            className="lg:hidden"
            style={{
              position: 'fixed', top: 0, bottom: 0,
              ...(lang === 'ar' ? { right: 0 } : { left: 0 }),
              width: 'min(82vw, 320px)', maxWidth: '100vw',
              background: 'var(--surface)', zIndex: 1500,
              display: 'flex', flexDirection: 'column',
              boxShadow: lang === 'ar' ? '-8px 0 32px rgba(0,0,0,0.18)' : '8px 0 32px rgba(0,0,0,0.18)',
              animation: `${lang === 'ar' ? 'drawerInRight' : 'drawerInLeft'} 0.28s cubic-bezier(0.22,1,0.36,1)`,
            }}
          >
            {/* Drawer header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0,
            }}>
              <div style={{
                fontSize: 15, fontWeight: 800, color: 'var(--primary)',
                fontFamily: 'Cairo,sans-serif',
              }}>
                {lang === 'ar' ? siteName.ar : siteName.en}
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label={t('إغلاق', 'Close')}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none',
                  background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable links — all public pages */}
            <nav style={{
              flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
              padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {NAV_LINKS.map((link) => (
                <button
                  key={link.page}
                  onClick={() => { setPage(link.page); setMobileOpen(false); }}
                  style={{
                    padding: '12px 14px', minHeight: 48, borderRadius: 10, border: 'none',
                    textAlign: lang === 'ar' ? 'right' : 'left', cursor: 'pointer',
                    fontSize: 15, fontWeight: currentPage === link.page ? 700 : 500,
                    fontFamily: 'Cairo,sans-serif', flexShrink: 0,
                    background: currentPage === link.page ? 'var(--primary-light)' : 'none',
                    color: currentPage === link.page ? 'var(--primary)' : 'var(--text)',
                  }}
                >
                  {lang === 'ar' ? link.ar : link.en}
                </button>
              ))}
            </nav>

            {/* Drawer footer — search + admin/login */}
            <div style={{
              borderTop: '1px solid var(--border)', padding: '12px',
              display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
            }}>
              <button
                onClick={() => { setMobileOpen(false); onSearch(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  minHeight: 44, borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--surface-2)', cursor: 'pointer', color: 'var(--text)',
                  fontSize: 14, fontFamily: 'Cairo,sans-serif',
                }}
              >
                🔍 {t('بحث', 'Search')}
              </button>
              <button
                onClick={() => { setMobileOpen(false); setPage(isAdmin ? 'admin' : 'login'); }}
                style={{
                  minHeight: 44, borderRadius: 10, border: 'none',
                  background: isAdmin ? 'var(--secondary)' : 'var(--primary)',
                  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  fontFamily: 'Cairo,sans-serif',
                }}
              >
                {isAdmin ? t('لوحة التحكم', 'Dashboard') : t('تسجيل الدخول', 'Admin')}
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
