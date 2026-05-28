import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const { data } = useApp();
  const [out, setOut] = useState(false);
  const logo = data.logoSettings.url;
  const nameAr = data.siteName.ar;
  const subtitle = data.siteName.subtitle;

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2200);
    const t2 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div id="splash-screen" className={out ? 'out' : ''}>
      {/* Rings */}
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="splash-ring"
            style={{
              position: 'absolute',
              inset: i * -20,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.2)',
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
        <div
          className="splash-logo"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {logo ? (
            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 64, color: 'var(--primary)' }}>⚜️</span>
          )}
        </div>
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Cairo,sans-serif', letterSpacing: '0.01em' }}>
          {nameAr}
        </div>
        <div style={{ fontSize: 13, marginTop: 6, opacity: 0.65, letterSpacing: '0.06em', fontFamily: 'Jost,sans-serif' }}>
          {subtitle}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="splash-dot" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    </div>
  );
}
