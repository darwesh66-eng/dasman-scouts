import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function CalendarPage() {
  const { data, lang, t } = useApp();
  useScrollReveal();
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const today = new Date().toISOString().split('T')[0];
  const upcoming = data.events
    .filter((e) => e.date >= today)
    .filter((e) => filterGroup === 'all' || e.groupId === filterGroup || !e.groupId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = data.events
    .filter((e) => e.date < today)
    .filter((e) => filterGroup === 'all' || e.groupId === filterGroup || !e.groupId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 56px', textAlign: 'center' }}>
        <h1 className="sa" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
          {t('الفعاليات', 'Events Calendar')}
        </h1>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 64px' }}>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterGroup('all')}
            style={{
              padding: '7px 18px', borderRadius: 100, border: `2px solid ${filterGroup === 'all' ? 'var(--primary)' : 'var(--border)'}`,
              background: filterGroup === 'all' ? 'var(--primary)' : 'var(--surface)',
              color: filterGroup === 'all' ? '#fff' : 'var(--text)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
            }}
          >
            {t('الكل', 'All')}
          </button>
          {data.groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setFilterGroup(g.id)}
              style={{
                padding: '7px 18px', borderRadius: 100, border: `2px solid ${filterGroup === g.id ? g.color : 'var(--border)'}`,
                background: filterGroup === g.id ? g.color : 'var(--surface)',
                color: filterGroup === g.id ? '#fff' : 'var(--text)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {g.emoji} {lang === 'ar' ? g.nameAr : g.nameEn}
            </button>
          ))}
        </div>

        {/* Upcoming events */}
        {upcoming.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <h2 className="sa" style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginBottom: 20, fontFamily: 'Cairo,sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📅</span> {t('الفعاليات القادمة', 'Upcoming Events')}
            </h2>
            {upcoming.map((ev, i) => {
              const group = data.groups.find((g) => g.id === ev.groupId);
              return (
                <div key={ev.id} className="card sa" style={{
                  marginBottom: 16, padding: 24, display: 'flex', gap: 20, alignItems: 'flex-start',
                  borderInlineStart: `4px solid ${group?.color ?? 'var(--secondary)'}`,
                }}>
                  <div style={{ minWidth: 64, textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: group?.color ?? 'var(--primary)', fontFamily: 'Playfair Display,serif' }}>
                      {new Date(ev.date).getDate()}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>
                      {new Date(ev.date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Cairo,sans-serif', marginBottom: 6 }}>
                      {lang === 'ar' ? ev.titleAr : ev.titleEn}
                    </div>
                    {(ev.descriptionAr || ev.descriptionEn) && (
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, fontFamily: 'Cairo,sans-serif', marginBottom: 8 }}>
                        {lang === 'ar' ? ev.descriptionAr : ev.descriptionEn}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span>🗓️ {formatDate(ev.date)}</span>
                      {ev.time && <span>⏰ {ev.time}</span>}
                      {group && (
                        <span style={{ padding: '2px 8px', borderRadius: 100, background: group.color + '22', color: group.color, fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>
                          {group.emoji} {lang === 'ar' ? group.nameAr : group.nameEn}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Past events */}
        {past.length > 0 && (
          <section>
            <h2 className="sa" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'Cairo,sans-serif' }}>
              {t('الفعاليات السابقة', 'Past Events')}
            </h2>
            {past.map((ev) => {
              const group = data.groups.find((g) => g.id === ev.groupId);
              return (
                <div key={ev.id} className="card sa" style={{ marginBottom: 12, padding: '16px 24px', opacity: 0.65, display: 'flex', gap: 16, alignItems: 'center', borderInlineStart: `4px solid ${group?.color ?? 'var(--border)'}` }}>
                  <div style={{ minWidth: 50 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Playfair Display,serif' }}>
                      {new Date(ev.date).getDate()}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>
                      {new Date(ev.date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>
                    {lang === 'ar' ? ev.titleAr : ev.titleEn}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {upcoming.length === 0 && past.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', fontSize: 16 }}>
            {t('لا توجد فعاليات بعد', 'No events yet')}
          </div>
        )}
      </div>
    </div>
  );
}
