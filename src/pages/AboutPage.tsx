import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import GradientMesh from '@/components/GradientMesh';

export default function AboutPage() {
  const { data, lang, t } = useApp();
  useScrollReveal();

  const about = lang === 'ar' ? data.about.ar : data.about.en;

  const cards = [
    { icon: '🕰️', title: t('رسالتنا', 'Our Mission'), content: about.mission },
    { icon: '🌟', title: t('رؤيتنا', 'Our Vision'), content: about.vision },
  ];

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero banner */}
      <div style={{ position: 'relative', background: 'var(--primary)', color: '#fff', padding: '64px 24px 80px', overflow: 'hidden', textAlign: 'center' }}>
        <GradientMesh />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <span className="label sa" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', marginBottom: 16, display: 'inline-block' }}>
            {t('مجموعة دسمان الكشفية', 'Dasman Scout Group')}
          </span>
          <h1 className="sa delay-1" style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif', margin: '8px 0 16px' }}>
            {t('عن المجموعة', 'About Us')}
          </h1>
          <p className="sa delay-2" style={{ fontSize: 17, opacity: 0.8, lineHeight: 1.8, fontFamily: 'Cairo,sans-serif' }}>
            {t('تعرّف على تاريخنا ورسالتنا ورؤيتنا المستقبلية', 'Learn about our history, mission, and future vision')}
          </p>
        </div>
      </div>

      {/* History */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
        <div className="sa" style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '40px',
          boxShadow: 'var(--shadow)', marginBottom: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              📜
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Cairo,sans-serif' }}>
              {t('التاريخ والنشأة', 'History & Origin')}
            </h2>
          </div>
          <p style={{ fontSize: 16, lineHeight: 2, color: 'var(--text)', fontFamily: 'Cairo,sans-serif' }}>
            {about.history}
          </p>
        </div>

        {/* Mission & Vision cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
          {cards.map((card, i) => (
            <div
              key={i}
              className={`card sa delay-${i + 1}`}
              style={{ padding: 36 }}
            >
              <div style={{ fontSize: 42, marginBottom: 16 }}>{card.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginBottom: 12, fontFamily: 'Cairo,sans-serif' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text)', fontFamily: 'Cairo,sans-serif' }}>
                {card.content}
              </p>
            </div>
          ))}
        </div>

        {/* Groups overview */}
        <div className="sa" style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginBottom: 24, textAlign: 'center', fontFamily: 'Cairo,sans-serif' }}>
            {t('فرقنا الكشفية', 'Our Scout Groups')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {data.groups.map((g, i) => (
              <div
                key={g.id}
                className={`card sa-scale delay-${i + 1}`}
                style={{ padding: 24, borderTop: `4px solid ${g.color}`, textAlign: 'center' }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>{g.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: 'Cairo,sans-serif', marginBottom: 8 }}>
                  {lang === 'ar' ? g.nameAr : g.nameEn}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, fontFamily: 'Cairo,sans-serif' }}>
                  {lang === 'ar' ? g.descriptionAr : g.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
