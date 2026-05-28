import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useTilt } from '@/hooks/useTilt';

function LeaderCard({ leader }: { leader: import('@/contexts/AppContext').Leader }) {
  const { data, lang } = useApp();
  const group = data.groups.find((g) => g.id === leader.groupId);
  const tilt = useTilt(8);

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="card sa-scale"
      style={{ overflow: 'hidden' }}
    >
      <div style={{ height: 'var(--card-img-h)', background: 'var(--surface-2)', position: 'relative', overflow: 'hidden' }}>
        {leader.photo ? (
          <img src={leader.photo} alt={leader.nameAr} style={{ width: '100%', height: '100%', objectFit: 'var(--img-fit)' as 'cover' }} loading="lazy" />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, background: 'var(--primary-light)' }}>🎖️</div>
        )}
        {group && (
          <div style={{ position: 'absolute', top: 12, insetInlineStart: 12 }}>
            <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: group.color, color: '#fff', fontFamily: 'Cairo,sans-serif' }}>
              {group.emoji} {lang === 'ar' ? group.nameAr : group.nameEn}
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Cairo,sans-serif', color: 'var(--text)', marginBottom: 4 }}>
          {lang === 'ar' ? leader.nameAr : leader.nameEn}
        </div>
        <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>
          {lang === 'ar' ? leader.role : leader.roleEn}
        </div>
      </div>
    </div>
  );
}

export default function LeadersPage() {
  const { data, lang, t } = useApp();
  useScrollReveal();

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 56px', textAlign: 'center' }}>
        <h1 className="sa" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
          {t('القادة', 'Our Leaders')}
        </h1>
        <p className="sa delay-1" style={{ fontSize: 16, opacity: 0.8, marginTop: 8 }}>
          {t(`${data.leaders.length} قائد ومعلم`, `${data.leaders.length} dedicated leaders`)}
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 64px' }}>
        {data.groups.map((group) => {
          const groupLeaders = data.leaders.filter((l) => l.groupId === group.id);
          if (groupLeaders.length === 0) return null;
          return (
            <section key={group.id} style={{ marginBottom: 48 }}>
              <div className="sa" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <span style={{ fontSize: 28 }}>{group.emoji}</span>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Cairo,sans-serif' }}>
                  {lang === 'ar' ? group.nameAr : group.nameEn}
                </h2>
                <span style={{ padding: '2px 12px', borderRadius: 100, background: group.color + '22', color: group.color, fontSize: 13, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
                  {groupLeaders.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                {groupLeaders.map((l, i) => (
                  <LeaderCard key={l.id} leader={l} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Leaders with no group */}
        {(() => {
          const ungrouped = data.leaders.filter((l) => !l.groupId || !data.groups.find((g) => g.id === l.groupId));
          if (ungrouped.length === 0) return null;
          return (
            <section style={{ marginBottom: 48 }}>
              <h2 className="sa" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'Cairo,sans-serif', marginBottom: 24 }}>
                {t('قادة عامون', 'General Leaders')}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
                {ungrouped.map((l) => <LeaderCard key={l.id} leader={l} />)}
              </div>
            </section>
          );
        })()}

        {data.leaders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', fontSize: 16 }}>
            {t('لا يوجد قادة بعد', 'No leaders added yet')}
          </div>
        )}
      </div>
    </div>
  );
}
