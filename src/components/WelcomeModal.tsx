import React, { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

interface Props { onClose: () => void }

export default function WelcomeModal({ onClose }: Props) {
  const { data, lang } = useApp();
  const wp = data.welcomePopup;

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          width: '100%',
          maxWidth: 480,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          animation: 'welcomeSlideUp 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Optional image */}
        {wp.image && (
          <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
            <img src={wp.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--surface))' }} />
          </div>
        )}

        {/* No image: decorative header band */}
        {!wp.image && (
          <div style={{
            height: 8,
            background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
          }} />
        )}

        <div style={{ padding: '32px 32px 28px' }}>
          {/* Scout icon */}
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>⚜️</div>

          <h2 style={{
            fontSize: 'clamp(20px,4vw,26px)', fontWeight: 900, textAlign: 'center',
            color: 'var(--text)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif',
            marginBottom: 14, lineHeight: 1.3,
          }}>
            {lang === 'ar' ? wp.titleAr : wp.titleEn}
          </h2>

          <p style={{
            fontSize: 15, textAlign: 'center', color: 'var(--text-muted)',
            lineHeight: 1.8, fontFamily: 'Cairo,sans-serif', marginBottom: 28,
          }}>
            {lang === 'ar' ? wp.bodyAr : wp.bodyEn}
          </p>

          {/* CTA button */}
          <button
            onClick={onClose}
            style={{
              display: 'block', width: '100%',
              padding: '14px 24px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'Cairo,sans-serif',
              boxShadow: '0 8px 24px rgba(27,58,107,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,107,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,58,107,0.3)'; }}
          >
            {lang === 'ar' ? wp.btnTextAr : wp.btnTextEn}
          </button>

          {/* Dismiss text */}
          <button
            onClick={onClose}
            style={{
              display: 'block', width: '100%', marginTop: 12,
              padding: '8px', border: 'none', background: 'none',
              color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
              fontFamily: 'Cairo,sans-serif',
            }}
          >
            {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
}
