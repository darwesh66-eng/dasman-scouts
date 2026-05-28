import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useTilt } from '@/hooks/useTilt';

function ScoutCard({ scout, group, lang }: { scout: import('@/contexts/AppContext').Scout; group: import('@/contexts/AppContext').Group | undefined; lang: string }) {
  const { data } = useApp();
  const tilt = useTilt(8);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="card sa-scale"
      style={{ padding: 20, textAlign: 'center' }}
    >
      <div style={{
        width: 'var(--scout-photo)', height: 'var(--scout-photo)', borderRadius: '50%',
        overflow: 'hidden', margin: '0 auto 12px',
        border: `2px solid ${group?.color ?? 'var(--border)'}`,
        background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {scout.photo ? (
          <img src={scout.photo} alt={scout.nameAr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" />
        ) : (
          <span style={{ fontSize: 28 }}>👤</span>
        )}
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cairo,sans-serif', color: 'var(--text)' }}>
        {lang === 'ar' ? scout.nameAr : scout.nameEn}
      </div>
      {data.scoutFieldsConfig.grade && scout.grade && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'Jost,sans-serif' }}>
          {scout.grade}
        </div>
      )}
    </div>
  );
}

export default function GroupsPage() {
  const { data, lang, t } = useApp();
  useScrollReveal();
  const [activeGroup, setActiveGroup] = useState<string>(data.groups[0]?.id ?? '');

  const currentGroup = data.groups.find((g) => g.id === activeGroup);
  const scouts = data.scouts.filter((s) => s.groupId === activeGroup && s.visible);
  const leaders = data.leaders.filter((l) => l.groupId === activeGroup);

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 56px', textAlign: 'center' }}>
        <h1 className="sa" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
          {t('الفرق الكشفية', 'Scout Groups')}
        </h1>
        <p className="sa delay-1" style={{ fontSize: 16, opacity: 0.8, marginTop: 8, fontFamily: 'Cairo,sans-serif' }}>
          {t('اختر الفرقة لعرض أعضائها وقادتها', 'Select a group to view its members and leaders')}
        </p>
      </div>

      {/* Group tabs */}
      <div style={{ display: 'flex', gap: 12, padding: '24px', maxWidth: 1100, margin: '0 auto', overflowX: 'auto', flexWrap: 'wrap' }}>
        {data.groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGroup(g.id)}
            style={{
              padding: '10px 24px', borderRadius: 100, border: `2px solid ${activeGroup === g.id ? g.color : 'var(--border)'}`,
              background: activeGroup === g.id ? g.color : 'var(--surface)',
              color: activeGroup === g.id ? '#fff' : 'var(--text)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
          >
            <span>{g.emoji}</span>
            <span>{lang === 'ar' ? g.nameAr : g.nameEn}</span>
          </button>
        ))}
      </div>

      {/* Group content */}
      {currentGroup && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>
          {/* Group card */}
          <div className="card sa" style={{ padding: 32, borderTop: `6px solid ${currentGroup.color}`, marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 56 }}>{currentGroup.emoji}</div>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', fontFamily: 'Cairo,sans-serif' }}>
                  {lang === 'ar' ? currentGroup.nameAr : currentGroup.nameEn}
                </h2>
                <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.7, fontFamily: 'Cairo,sans-serif' }}>
                  {lang === 'ar' ? currentGroup.descriptionAr : currentGroup.descriptionEn}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 24, marginTop: 24, flexWrap: 'wrap' }}>
              {[
                { label: t('الكشافين', 'Scouts'), value: scouts.length },
                { label: t('القادة', 'Leaders'), value: leaders.length },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: currentGroup.color }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaders */}
          {leaders.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h3 className="sa" style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginBottom: 20, fontFamily: 'Cairo,sans-serif' }}>
                {t('القادة', 'Leaders')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
                {leaders.map((l, i) => (
                  <div key={l.id} className={`card sa-scale delay-${Math.min(i + 1, 5)}`} style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', border: `2px solid ${currentGroup.color}`, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {l.photo ? <img src={l.photo} alt={l.nameAr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <span style={{ fontSize: 24 }}>🎖️</span>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{lang === 'ar' ? l.nameAr : l.nameEn}</div>
                    <div style={{ fontSize: 12, color: currentGroup.color, marginTop: 4, fontFamily: 'Cairo,sans-serif' }}>{lang === 'ar' ? l.role : l.roleEn}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Scouts */}
          <section>
            <h3 className="sa" style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginBottom: 20, fontFamily: 'Cairo,sans-serif' }}>
              {t('الكشافون', 'Scouts')} ({scouts.length})
            </h3>
            {scouts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', fontSize: 16 }}>
                {t('لا يوجد كشافون في هذه الفرقة بعد', 'No scouts in this group yet')}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 14 }}>
                {scouts.map((s, i) => (
                  <ScoutCard key={s.id} scout={s} group={currentGroup} lang={lang} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
