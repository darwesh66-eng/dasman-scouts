import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function ArchivePage() {
  const { data, lang, t } = useApp();
  useScrollReveal();
  const [selected, setSelected] = useState<string | null>(null);

  const sorted = [...data.archive].sort((a, b) => b.year.localeCompare(a.year));
  const current = selected ? data.archive.find((a) => a.id === selected) : null;

  if (current) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ background: 'var(--primary)', color: '#fff', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setSelected(null)}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}
          >
            {t('← رجوع', '← Back')}
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
              {t('أرشيف', 'Archive')} {current.year}
            </h1>
            <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4, fontFamily: 'Cairo,sans-serif' }}>
              {lang === 'ar' ? current.descriptionAr : current.descriptionEn}
            </p>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 64px' }}>
          {current.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>
              {t('لا توجد عناصر في هذا الأرشيف', 'No items in this archive')}
            </div>
          ) : (
            <div style={{ columns: '3 260px', gap: 16 }}>
              {current.items.map((item) => (
                <div key={item.id} className="card" style={{ breakInside: 'avoid', marginBottom: 16, overflow: 'hidden' }}>
                  {item.type === 'image' && (
                    <img src={item.url} alt="" style={{ width: '100%', display: 'block' }} loading="lazy" />
                  )}
                  {item.type === 'youtube' && (() => {
                    const vid = item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/)?.[1];
                    return vid ? (
                      <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
                        <img src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>▶</div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  {(item.captionAr || item.captionEn) && (
                    <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>
                      {lang === 'ar' ? item.captionAr : item.captionEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 56px', textAlign: 'center' }}>
        <h1 className="sa" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
          {t('الأرشيف', 'Archive')}
        </h1>
        <p className="sa delay-1" style={{ fontSize: 16, opacity: 0.8, marginTop: 8 }}>
          {t('سجل سنوي لأبرز أحداث مجموعتنا', 'Annual record of our group\'s highlights')}
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 64px' }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', fontSize: 16 }}>
            {t('لا يوجد أرشيف بعد', 'No archive entries yet')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
            {sorted.map((year, i) => (
              <button
                key={year.id}
                className={`card sa delay-${Math.min(i + 1, 5)}`}
                style={{ padding: 0, border: 'none', cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left', overflow: 'hidden', display: 'block', width: '100%' }}
                onClick={() => setSelected(year.id)}
              >
                {year.coverPhoto ? (
                  <div style={{ height: 180, overflow: 'hidden' }}>
                    <img src={year.coverPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} loading="lazy" />
                  </div>
                ) : (
                  <div style={{ height: 140, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: 'var(--primary)' }}>
                    📦
                  </div>
                )}
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)', fontFamily: 'Playfair Display,serif' }}>
                    {year.year}
                  </div>
                  {(year.descriptionAr || year.descriptionEn) && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6, fontFamily: 'Cairo,sans-serif' }}>
                      {lang === 'ar' ? year.descriptionAr : year.descriptionEn}
                    </p>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 10, fontWeight: 600, fontFamily: 'Jost,sans-serif' }}>
                    {year.items.length} {t('عنصر', 'items')} →
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
