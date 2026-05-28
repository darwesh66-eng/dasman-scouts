import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useTilt } from '@/hooks/useTilt';

function NewsCard({ news }: { news: import('@/contexts/AppContext').NewsItem }) {
  const { lang } = useApp();
  const tilt = useTilt(7);

  return (
    <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} className="card sa">
      {news.image && (
        <div style={{ height: 'var(--card-img-h)', overflow: 'hidden', background: 'var(--surface-2)' }}>
          <img src={news.image} alt={news.titleAr} style={{ width: '100%', height: '100%', objectFit: 'var(--img-fit)' as 'cover', transition: 'transform 0.4s ease' }} loading="lazy" />
        </div>
      )}
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span className="label" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {lang === 'ar' ? 'خبر' : 'News'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>
            {new Date(news.date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', fontFamily: 'Cairo,sans-serif', marginBottom: 10, lineHeight: 1.4 }}>
          {lang === 'ar' ? news.titleAr : news.titleEn}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75, fontFamily: 'Cairo,sans-serif', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {lang === 'ar' ? news.contentAr : news.contentEn}
        </p>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { data, lang, t } = useApp();
  useScrollReveal();

  const published = data.news.filter((n) => n.published).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 56px', textAlign: 'center' }}>
        <h1 className="sa" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
          {t('الأخبار', 'News')}
        </h1>
        <p className="sa delay-1" style={{ fontSize: 16, opacity: 0.8, marginTop: 8 }}>
          {t(`${published.length} خبر منشور`, `${published.length} published articles`)}
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 64px' }}>
        {published.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', fontSize: 16 }}>
            {t('لا توجد أخبار منشورة حالياً', 'No published news yet')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
            {published.map((n) => <NewsCard key={n.id} news={n} />)}
          </div>
        )}
      </div>
    </div>
  );
}
