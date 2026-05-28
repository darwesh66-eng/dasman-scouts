import React from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Scout } from '@/contexts/AppContext';

interface Props {
  scout: Scout;
  onClose: () => void;
}

export default function MembershipCard({ scout, onClose }: Props) {
  const { data, t } = useApp();
  const group = data.groups.find((g) => g.id === scout.groupId);
  const logo = data.logoSettings.url;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="print-card"
        style={{
          width: 340,
          minHeight: 200,
          borderRadius: 20,
          background: 'linear-gradient(135deg, var(--primary) 0%, #2d5fa6 100%)',
          color: '#fff',
          padding: 28,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          {logo && (
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
              <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, letterSpacing: '0.06em', fontFamily: 'Jost,sans-serif' }}>
              {data.siteName.subtitle}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
              {t(data.siteName.ar, data.siteName.en)}
            </div>
          </div>
        </div>

        {/* Scout info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
            border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0, background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {scout.photo ? (
              <img src={scout.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 32 }}>👤</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Cairo,sans-serif', lineHeight: 1.2 }}>
              {scout.nameAr}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2, fontFamily: 'Jost,sans-serif' }}>
              {scout.nameEn}
            </div>
            {group && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{group.emoji}</span>
                <span style={{
                  padding: '2px 10px', borderRadius: 100,
                  background: group.color + '33', border: `1px solid ${group.color}66`,
                  fontSize: 12, fontWeight: 600, fontFamily: 'Cairo,sans-serif',
                }}>
                  {t(group.nameAr, group.nameEn)}
                </span>
              </div>
            )}
            {data.scoutFieldsConfig.grade && scout.grade && (
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
                {t('الصف', 'Grade')}: {scout.grade}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 24 }}>⚜️</span>
          <span style={{ fontSize: 12, opacity: 0.6, fontFamily: 'Jost,sans-serif' }}>
            {new Date().getFullYear()}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => window.print()}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
            }}
          >
            🖨️ {t('طباعة', 'Print')}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 10,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
            }}
          >
            {t('إغلاق', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
