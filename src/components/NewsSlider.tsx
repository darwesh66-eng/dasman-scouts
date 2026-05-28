import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';

interface Props {
  setPage: (p: string) => void;
}

export default function NewsSlider({ setPage }: Props) {
  const { data, lang } = useApp();
  const news = data.news.filter((n) => n.published && n.image).slice(0, 6);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive((a) => (a + 1) % news.length), [news.length]);
  const prev = useCallback(() => setActive((a) => (a - 1 + news.length) % news.length), [news.length]);

  useEffect(() => {
    if (paused || news.length <= 1) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next, paused, news.length]);

  if (news.length === 0) return null;

  const item = news[active];
  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <section
      style={{ padding: '0 24px 72px', maxWidth: 1100, margin: '0 auto' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Heading */}
      <div className="sa" style={{ textAlign: 'center', marginBottom: 36 }}>
        <span className="label" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: 12, display: 'inline-block' }}>
          {lang === 'ar' ? 'آخر الأخبار' : 'Latest News'}
        </span>
        <h2 style={{
          fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: 'var(--text)',
          fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif',
        }}>
          {lang === 'ar' ? 'أخبار المجموعة' : 'Scout News'}
        </h2>
      </div>

      {/* Slider */}
      <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '21/9', overflow: 'hidden', background: 'var(--surface-2)' }}>
          <img
            key={item.id}
            src={item.image}
            alt={lang === 'ar' ? item.titleAr : item.titleEn}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              animation: 'slideImgIn 0.55s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,20,45,0.85) 0%, rgba(10,20,45,0.3) 55%, transparent 100%)',
          }} />

          {/* Content on image */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: 'clamp(16px,4vw,36px)',
            display: 'flex', flexDirection: 'column', gap: 10,
            direction: lang === 'ar' ? 'rtl' : 'ltr',
          }}>
            <span style={{
              display: 'inline-block', padding: '3px 12px', borderRadius: 100,
              background: 'var(--secondary)', color: '#fff',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
              textTransform: 'uppercase', fontFamily: 'Jost,sans-serif',
              width: 'fit-content',
            }}>
              📰 {formattedDate}
            </span>
            <h3 style={{
              fontSize: 'clamp(18px,3.5vw,32px)', fontWeight: 900, color: '#fff',
              fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif',
              lineHeight: 1.25, margin: 0,
              animation: 'slideTextIn 0.55s 0.1s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              {lang === 'ar' ? item.titleAr : item.titleEn}
            </h3>
            <button
              onClick={() => setPage('news')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 20px', borderRadius: 10, border: 'none',
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Cairo,sans-serif', width: 'fit-content',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.28)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
            >
              {lang === 'ar' ? 'اقرأ المزيد ←' : 'Read More →'}
            </button>
          </div>

          {/* Nav arrows */}
          {news.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="previous"
                style={{
                  position: 'absolute', top: '50%', insetInlineStart: 14,
                  transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                  color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              >‹</button>
              <button
                onClick={next}
                aria-label="next"
                style={{
                  position: 'absolute', top: '50%', insetInlineEnd: 14,
                  transform: 'translateY(-50%)',
                  width: 40, height: 40, borderRadius: '50%', border: 'none',
                  background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                  color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              >›</button>
            </>
          )}
        </div>

        {/* Dots */}
        {news.length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 6,
            padding: '14px 0', background: 'var(--surface)',
          }}>
            {news.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? 24 : 8, height: 8, borderRadius: 99,
                  border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                  background: i === active ? 'var(--primary)' : 'var(--border)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideImgIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideTextIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
