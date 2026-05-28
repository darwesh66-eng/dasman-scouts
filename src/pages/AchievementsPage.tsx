import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useTilt } from '@/hooks/useTilt';

function AchievementCard({ a }: { a: import('@/contexts/AppContext').Achievement }) {
  const { lang } = useApp();
  const tilt = useTilt(9);

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="card sa-scale"
      style={{ padding: 28, textAlign: 'center' }}
    >
      <div style={{ fontSize: 48, marginBottom: 14 }}>{a.icon || '🏆'}</div>
      {a.year && (
        <span className="label" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: 10, display: 'inline-block' }}>
          {a.year}
        </span>
      )}
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: 'Cairo,sans-serif', marginBottom: 8, lineHeight: 1.4 }}>
        {lang === 'ar' ? a.titleAr : a.titleEn}
      </h3>
      {(a.descriptionAr || a.descriptionEn) && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75, fontFamily: 'Cairo,sans-serif' }}>
          {lang === 'ar' ? a.descriptionAr : a.descriptionEn}
        </p>
      )}
    </div>
  );
}

export default function AchievementsPage() {
  const { data, lang, t } = useApp();
  useScrollReveal();

  // Group by year
  const years = [...new Set(data.achievements.map((a) => a.year).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const noYear = data.achievements.filter((a) => !a.year);

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 56px', textAlign: 'center' }}>
        <h1 className="sa" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
          {t('الإنجازات', 'Achievements')}
        </h1>
        <p className="sa delay-1" style={{ fontSize: 16, opacity: 0.8, marginTop: 8 }}>
          {t(`فخورون بـ ${data.achievements.length} إنجاز`, `Proud of ${data.achievements.length} achievements`)}
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 64px' }}>
        {data.achievements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', fontSize: 16 }}>
            {t('لا توجد إنجازات بعد', 'No achievements yet')}
          </div>
        ) : (
          <>
            {years.map((year) => (
              <section key={year} style={{ marginBottom: 48 }}>
                <h2 className="sa" style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', marginBottom: 24, fontFamily: 'Playfair Display,serif', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 40, height: 3, background: 'var(--primary)', display: 'inline-block' }} />
                  {year}
                  <span style={{ width: 40, height: 3, background: 'var(--primary)', display: 'inline-block' }} />
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                  {data.achievements.filter((a) => a.year === year).map((a) => (
                    <AchievementCard key={a.id} a={a} />
                  ))}
                </div>
              </section>
            ))}
            {noYear.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                {noYear.map((a) => <AchievementCard key={a.id} a={a} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
