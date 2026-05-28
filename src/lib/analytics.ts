// ─── Simple client-side analytics (localStorage) ─────────────
const ANALYTICS_KEY = 'dasman_analytics_v1';

export interface PageStats { [page: string]: number }
export interface DailyStats { [date: string]: number }
export interface AnalyticsData {
  total: number;
  pages: PageStats;
  daily: DailyStats;
  lastVisit: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function trackPageView(page: string): void {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    const a: AnalyticsData = raw
      ? JSON.parse(raw)
      : { total: 0, pages: {}, daily: {}, lastVisit: '' };

    a.total = (a.total || 0) + 1;
    a.pages[page] = (a.pages[page] || 0) + 1;
    const d = today();
    a.daily[d] = (a.daily[d] || 0) + 1;
    a.lastVisit = new Date().toISOString();

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(a));
  } catch { /* ignore */ }
}

export function getAnalytics(): AnalyticsData {
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? JSON.parse(raw) : { total: 0, pages: {}, daily: {}, lastVisit: '' };
  } catch {
    return { total: 0, pages: {}, daily: {}, lastVisit: '' };
  }
}

export function clearAnalytics(): void {
  localStorage.removeItem(ANALYTICS_KEY);
}

// Last N days array
export function lastNDays(n = 14): { date: string; views: number }[] {
  const a = getAnalytics();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, views: a.daily[key] || 0 };
  });
}
