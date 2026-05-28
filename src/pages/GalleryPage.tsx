import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function getYoutubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/);
  return m ? m[1] : null;
}

function getInstaShortcode(url: string) {
  const m = url.match(/instagram\.com\/(?:p|reel)\/([^/?]+)/);
  return m ? m[1] : null;
}

export default function GalleryPage() {
  const { data, lang, t } = useApp();
  useScrollReveal();
  const [lightbox, setLightbox] = useState<import('@/contexts/AppContext').GalleryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'image' | 'youtube' | 'instagram'>('all');

  const galleryFit = data.mediaSettings.galleryFit;
  const filtered = data.gallery.filter((g) => filter === 'all' || g.type === filter);

  const imgStyle = galleryFit === 'natural' ? { width: '100%', height: 'auto' } : { width: '100%', height: '100%', objectFit: galleryFit as 'cover' | 'contain' };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 56px', textAlign: 'center' }}>
        <h1 className="sa" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
          {t('المعرض', 'Gallery')}
        </h1>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 64px' }}>
        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(['all', 'image', 'youtube', 'instagram'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 18px', borderRadius: 100, border: `2px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                background: filter === f ? 'var(--primary)' : 'var(--surface)',
                color: filter === f ? '#fff' : 'var(--text)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {f === 'all' ? t('الكل', 'All') : f === 'image' ? t('صور', 'Images') : f === 'youtube' ? 'YouTube' : 'Instagram'}
            </button>
          ))}
        </div>

        {/* Masonry-style grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', fontSize: 16 }}>
            {t('لا توجد عناصر في المعرض بعد', 'No gallery items yet')}
          </div>
        ) : (
          <div style={{ columns: '3 280px', gap: 16 }}>
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className="card sa"
                style={{ breakInside: 'avoid', marginBottom: 16, cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => setLightbox(item)}
              >
                {item.type === 'image' && (
                  <div style={{ background: 'var(--surface-2)', overflow: 'hidden', ...(galleryFit !== 'natural' && { height: 240 }) }}>
                    <img src={item.url} alt={lang === 'ar' ? item.captionAr : item.captionEn} style={imgStyle} loading="lazy" decoding="async" />
                  </div>
                )}
                {item.type === 'youtube' && (() => {
                  const vid = getYoutubeId(item.url);
                  return vid ? (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                      <img src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff' }}>▶</div>
                      </div>
                    </div>
                  ) : null;
                })()}
                {item.type === 'instagram' && (
                  <div style={{ height: 240, background: 'linear-gradient(135deg,#fd5949,#d6249f,#285AEB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                    📸
                  </div>
                )}
                {(item.captionAr || item.captionEn) && (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>
                    {lang === 'ar' ? item.captionAr : item.captionEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            {lightbox.type === 'image' && (
              <img src={lightbox.url} alt="" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 16 }} />
            )}
            {lightbox.type === 'youtube' && (() => {
              const vid = getYoutubeId(lightbox.url);
              return vid ? (
                <iframe
                  src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
                  style={{ width: 'min(800px,90vw)', height: 'min(450px,50vh)', border: 'none', borderRadius: 16 }}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : null;
            })()}
            {lightbox.type === 'instagram' && (() => {
              const sc = getInstaShortcode(lightbox.url);
              return sc ? (
                <iframe
                  src={`https://www.instagram.com/p/${sc}/embed`}
                  style={{ width: 'min(450px,90vw)', height: 'min(550px,85vh)', border: 'none', borderRadius: 16 }}
                  scrolling="no"
                />
              ) : null;
            })()}
            <button
              onClick={() => setLightbox(null)}
              style={{ position: 'absolute', top: -16, insetInlineEnd: -16, width: 36, height: 36, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
