import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';

type Result = {
  type: string;
  labelAr: string;
  labelEn: string;
  sub?: string;
  page: string;
  icon: string;
};

interface Props {
  onClose: () => void;
  setPage: (p: string) => void;
}

export default function SearchModal({ onClose, setPage }: Props) {
  const { data, lang, t } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const results: Result[] = [];

  if (q.length >= 2) {
    // Scouts
    data.scouts
      .filter((s) => s.visible)
      .forEach((s) => {
        if (s.nameAr.includes(q) || s.nameEn.toLowerCase().includes(q)) {
          const group = data.groups.find((g) => g.id === s.groupId);
          results.push({
            type: t('كشاف', 'Scout'), labelAr: s.nameAr, labelEn: s.nameEn,
            sub: group ? t(group.nameAr, group.nameEn) : '',
            page: 'groups', icon: '👤',
          });
        }
      });

    // News
    data.news
      .filter((n) => n.published)
      .forEach((n) => {
        if (n.titleAr.includes(q) || n.titleEn.toLowerCase().includes(q)) {
          results.push({
            type: t('خبر', 'News'), labelAr: n.titleAr, labelEn: n.titleEn,
            page: 'news', icon: '📰',
          });
        }
      });

    // Activities
    data.activities.forEach((a) => {
      if (a.nameAr.includes(q) || a.nameEn.toLowerCase().includes(q)) {
        results.push({
          type: t('نشاط', 'Activity'), labelAr: a.nameAr, labelEn: a.nameEn,
          page: 'home', icon: '⚡',
        });
      }
    });

    // Events
    data.events.forEach((ev) => {
      if (ev.titleAr.includes(q) || ev.titleEn.toLowerCase().includes(q)) {
        results.push({
          type: t('فعالية', 'Event'), labelAr: ev.titleAr, labelEn: ev.titleEn,
          page: 'calendar', icon: '🗓️',
        });
      }
    });

    // Leaders
    data.leaders.forEach((l) => {
      if (l.nameAr.includes(q) || l.nameEn.toLowerCase().includes(q)) {
        results.push({
          type: t('قائد', 'Leader'), labelAr: l.nameAr, labelEn: l.nameEn,
          sub: l.role, page: 'leaders', icon: '🎖️',
        });
      }
    });

    // Achievements
    data.achievements.forEach((a) => {
      if (a.titleAr.includes(q) || a.titleEn.toLowerCase().includes(q)) {
        results.push({
          type: t('إنجاز', 'Achievement'), labelAr: a.titleAr, labelEn: a.titleEn,
          page: 'achievements', icon: '🏆',
        });
      }
    });
  }

  const quickLinks = [
    { label: t('الرئيسية', 'Home'), page: 'home', icon: '🏠' },
    { label: t('عن المجموعة', 'About'), page: 'about', icon: '📖' },
    { label: t('القادة', 'Leaders'), page: 'leaders', icon: '🎖️' },
    { label: t('الفعاليات', 'Events'), page: 'calendar', icon: '🗓️' },
    { label: t('الإنجازات', 'Achievements'), page: 'achievements', icon: '🏆' },
  ];

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-box" onClick={(e) => e.stopPropagation()} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)', gap: 12 }}>
          <span style={{ fontSize: 20, opacity: 0.5 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('ابحث عن كشافين، أخبار، فعاليات...', 'Search scouts, news, events...')}
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 16,
              background: 'transparent', color: 'var(--text)', fontFamily: 'Cairo,sans-serif',
            }}
          />
          <kbd style={{
            padding: '2px 8px', borderRadius: 6, fontSize: 12,
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', cursor: 'pointer',
          }} onClick={onClose}>
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {q.length < 2 ? (
            <div style={{ padding: '12px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                {t('روابط سريعة', 'Quick Links')}
              </div>
              {quickLinks.map((ql) => (
                <button
                  key={ql.page}
                  onClick={() => { setPage(ql.page); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '9px 12px', borderRadius: 10, border: 'none',
                    background: 'none', cursor: 'pointer', color: 'var(--text)',
                    fontSize: 14, fontFamily: 'Cairo,sans-serif',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span>{ql.icon}</span>
                  <span>{ql.label}</span>
                </button>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
              {t('لا توجد نتائج لـ', 'No results for')} "{query}"
            </div>
          ) : (
            <div style={{ padding: '8px 12px' }}>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(r.page); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '10px 12px', borderRadius: 10, border: 'none',
                    background: 'none', cursor: 'pointer', color: 'var(--text)',
                    fontFamily: 'Cairo,sans-serif', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                  <div style={{ flex: 1, textAlign: lang === 'ar' ? 'right' : 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {lang === 'ar' ? r.labelAr : r.labelEn}
                    </div>
                    {r.sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{r.sub}</div>}
                  </div>
                  <span className="label" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 10 }}>
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '8px 18px 10px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{results.length > 0 && q.length >= 2 ? `${results.length} ${t('نتيجة', 'results')}` : ''}</span>
          <span style={{ fontFamily: 'Jost,sans-serif' }}>
            {t('اضغط Enter للتنقل', 'Press Enter to navigate')}
          </span>
        </div>
      </div>
    </div>
  );
}
