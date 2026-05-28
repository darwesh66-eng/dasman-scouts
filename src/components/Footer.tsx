import React from 'react';
import { useApp } from '@/contexts/AppContext';

export default function Footer({ setPage }: { setPage: (p: string) => void }) {
  const { data, lang, t } = useApp();
  const { logoSettings, siteName } = data;

  const shapeRadius =
    logoSettings.shape === 'circle' ? '50%'
    : logoSettings.shape === 'rounded' ? '14px'
    : '0px';

  const links = [
    { page: 'home', ar: 'الرئيسية', en: 'Home' },
    { page: 'about', ar: 'عن المجموعة', en: 'About' },
    { page: 'groups', ar: 'الفرق', en: 'Groups' },
    { page: 'leaders', ar: 'القادة', en: 'Leaders' },
    { page: 'news', ar: 'الأخبار', en: 'News' },
    { page: 'gallery', ar: 'المعرض', en: 'Gallery' },
    { page: 'calendar', ar: 'الفعاليات', en: 'Events' },
    { page: 'achievements', ar: 'الإنجازات', en: 'Achievements' },
  ];

  return (
    <footer
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        background: 'var(--primary)',
        color: '#fff',
        paddingBottom: 0,
        marginBottom: 0,
      }}
    >
      {/* Main footer grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40 }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {logoSettings.showInFooter && logoSettings.url && (
              <div style={{ width: logoSettings.footerSize, height: logoSettings.footerSize, borderRadius: shapeRadius, overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                <img src={logoSettings.url} alt="Logo" style={{ width: `${logoSettings.innerScale}%`, height: `${logoSettings.innerScale}%`, objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
                {lang === 'ar' ? siteName.ar : siteName.en}
              </div>
              {siteName.subtitle && (
                <div style={{ fontSize: 12, opacity: 0.65, fontFamily: 'Jost,sans-serif', marginTop: 2 }}>
                  {siteName.subtitle}
                </div>
              )}
            </div>
          </div>
          <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.8, fontFamily: 'Cairo,sans-serif' }}>
            {t(
              'نسعى لبناء جيل قادر على تحمل المسؤولية وخدمة الوطن والمجتمع.',
              'We strive to build a generation capable of responsibility and serving the nation.',
            )}
          </p>

          {/* Social links */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {data.instagram && (
              <a
                href={data.instagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              >
                📸
              </a>
            )}
            {data.whatsapp && (
              <a
                href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              >
                💬
              </a>
            )}
            {data.schoolUrl && (
              <a
                href={data.schoolUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'background 0.2s',
                }}
              >
                🏫
              </a>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, opacity: 0.8, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
            {t('الروابط', 'Links')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map((l) => (
              <button
                key={l.page}
                onClick={() => setPage(l.page)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: lang === 'ar' ? 'right' : 'left',
                  color: 'rgba(255,255,255,0.7)', fontSize: 14,
                  fontFamily: 'Cairo,sans-serif', padding: 0,
                  transition: 'color 0.2s', width: 'fit-content',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >
                {lang === 'ar' ? l.ar : l.en}
              </button>
            ))}
          </div>
        </div>

        {/* Groups */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, opacity: 0.8, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Jost,sans-serif' }}>
            {t('الفرق', 'Groups')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setPage('groups')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: lang === 'ar' ? 'right' : 'left',
                  color: 'rgba(255,255,255,0.7)', fontSize: 14,
                  fontFamily: 'Cairo,sans-serif', padding: 0, display: 'flex',
                  alignItems: 'center', gap: 8, transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                {lang === 'ar' ? g.nameAr : g.nameEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', textAlign: 'center', fontSize: 12, opacity: 0.55, fontFamily: 'Jost,sans-serif' }}>
        © {new Date().getFullYear()} {t(siteName.ar, siteName.en)} — {siteName.subtitle}
      </div>
    </footer>
  );
}
