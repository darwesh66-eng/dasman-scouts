import React from 'react';
import { useApp } from '@/contexts/AppContext';

type Page = string;

const items = [
  { page: 'home', icon: '🏠', ar: 'الرئيسية', en: 'Home' },
  { page: 'groups', icon: '⚜️', ar: 'الفرق', en: 'Groups' },
  { page: 'news', icon: '📰', ar: 'الأخبار', en: 'News' },
  { page: 'calendar', icon: '🗓️', ar: 'الفعاليات', en: 'Events' },
  { page: 'gallery', icon: '📷', ar: 'المعرض', en: 'Gallery' },
];

export default function BottomNav({
  currentPage,
  setPage,
}: {
  currentPage: Page;
  setPage: (p: Page) => void;
}) {
  const { t } = useApp();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const active = currentPage === item.page;
        return (
          <button
            key={item.page}
            onClick={() => setPage(item.page)}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: active ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: 10,
              fontFamily: 'Cairo,sans-serif',
              fontWeight: active ? 700 : 400,
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{t(item.ar, item.en)}</span>
            {active && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 4,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
