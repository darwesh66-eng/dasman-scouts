import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useApp } from '@/contexts/AppContext';
import { compressImage, getVideoThumbnail } from '@/lib/compress';
import { uploadToSupabase } from '@/lib/supabaseUpload';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { storeVideo } from '@/lib/videoStore';
import { getAnalytics, lastNDays, clearAnalytics } from '@/lib/analytics';
import RichEditor from '@/components/RichEditor';
import type {
  Group, Leader, Activity, ActivityMedia, GalleryItem, ArchiveYear,
  NewsItem, Achievement, CalendarEvent, HomeVideo, AdminUser, JoinRequest
} from '@/contexts/AppContext';

const ScoutsSection = lazy(() => import('./admin/ScoutsSection'));

// ─── Shared input components ─────────────────────────────────
function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif', color: 'var(--text)', background: 'var(--surface-2)' }}
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif', color: 'var(--text)', background: 'var(--surface-2)', resize: 'vertical' }}
      />
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 28, marginBottom: 20, border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Cairo,sans-serif', marginBottom: 18 }}>{title}</h3>
      {children}
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{label}</label>
        <span style={{ fontSize: 13, fontFamily: 'Jost,sans-serif', color: 'var(--primary)', fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif', minWidth: 24 }}>{min}</span>
        <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--primary)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif', minWidth: 24 }}>{max}</span>
      </div>
    </div>
  );
}

// ─── SECTION RENDERERS ────────────────────────────────────────

function OverviewSec({ setSection }: { setSection: (s: string) => void }) {
  const { data, setData, t, lang } = useApp();
  const [importMsg, setImportMsg] = useState('');
  const analytics = getAnalytics();
  const days = lastNDays(14);
  const maxViews = Math.max(...days.map((d) => d.views), 1);

  const stats = [
    { icon: '👥', label: t('الكشافون', 'Scouts'), value: data.scouts.length, section: 'scouts' },
    { icon: '🎖️', label: t('القادة', 'Leaders'), value: data.leaders.length, section: 'leaders' },
    { icon: '⚡', label: t('الأنشطة', 'Activities'), value: data.activities.length, section: 'activities' },
    { icon: '📰', label: t('الأخبار', 'News'), value: data.news.filter((n) => n.published).length, section: 'news' },
    { icon: '📷', label: t('المعرض', 'Gallery'), value: data.gallery.length, section: 'gallery' },
    { icon: '🏆', label: t('الإنجازات', 'Achievements'), value: data.achievements.length, section: 'achievements' },
    { icon: '🗓️', label: t('الفعاليات', 'Events'), value: data.events.length, section: 'calendar' },
    { icon: '📋', label: t('طلبات الانضمام', 'Join Requests'), value: (data.joinRequests || []).filter(r => r.status === 'pending').length, section: 'joinrequests' },
  ];

  // Export data as JSON file
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dasman-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data from JSON file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        setData({ ...data, ...imported });
        setImportMsg(t('✅ تم الاستيراد بنجاح!', '✅ Import successful!'));
        setTimeout(() => setImportMsg(''), 3000);
      } catch {
        setImportMsg(t('❌ ملف غير صالح', '❌ Invalid file'));
        setTimeout(() => setImportMsg(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map((s) => (
          <button key={s.section} onClick={() => setSection(s.section)} style={{ padding: '20px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)', fontFamily: 'Playfair Display,serif' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Analytics panel */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Cairo,sans-serif', margin: 0 }}>
            📊 {t('إحصائيات الزيارات (آخر 14 يوم)', 'Visit Analytics (Last 14 Days)')}
          </h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}>
              {t('الإجمالي:', 'Total:')} <strong style={{ color: 'var(--primary)' }}>{analytics.total}</strong>
            </span>
            <button
              onClick={() => { if (confirm(t('هل تريد حذف إحصائيات الزيارات؟', 'Clear all analytics data?'))) { clearAnalytics(); window.location.reload(); } }}
              style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}
            >
              {t('مسح', 'Clear')}
            </button>
          </div>
        </div>
        {/* Bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
          {days.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div
                title={`${d.date}: ${d.views} ${lang === 'ar' ? 'زيارة' : 'views'}`}
                style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: d.views ? `${Math.max((d.views / maxViews) * 64, 4)}px` : '3px',
                  background: d.views ? 'linear-gradient(to top, var(--primary), var(--secondary))' : 'var(--border)',
                  transition: 'height 0.3s',
                  cursor: 'default',
                }}
              />
              <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif', writingMode: 'vertical-lr', transform: 'rotate(180deg)', lineHeight: 1 }}>
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
        {/* Top pages */}
        {Object.keys(analytics.pages).length > 0 && (
          <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(analytics.pages)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([page, count]) => (
                <span key={page} style={{ padding: '3px 10px', borderRadius: 100, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12, fontFamily: 'Cairo,sans-serif', fontWeight: 700 }}>
                  {page}: {count}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Export / Import */}
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif', color: 'var(--text)', marginBottom: 4 }}>
            💾 {t('النسخ الاحتياطي', 'Data Backup')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>
            {t('تصدير أو استيراد جميع بيانات الموقع', 'Export or import all site data')}
          </div>
        </div>
        <button
          onClick={handleExport}
          style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}
        >
          ⬇️ {t('تصدير JSON', 'Export JSON')}
        </button>
        <label style={{ padding: '9px 20px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
          ⬆️ {t('استيراد JSON', 'Import JSON')}
          <input type="file" accept=".json,application/json" onChange={handleImport} style={{ display: 'none' }} />
        </label>
        {importMsg && <span style={{ fontSize: 13, fontFamily: 'Cairo,sans-serif', color: importMsg.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{importMsg}</span>}
      </div>
    </div>
  );
}

function HeroSec() {
  const { data, setData, t } = useApp();
  const [uploading, setUploading] = useState(false);

  const uploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 });
      setData({ ...data, heroImages: [...data.heroImages, url] });
    } catch { }
    setUploading(false);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 20 }}>
        {data.heroImages.map((img, i) => (
          <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', background: 'var(--surface-2)' }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            <button
              onClick={() => setData({ ...data, heroImages: data.heroImages.filter((_, j) => j !== i) })}
              style={{ position: 'absolute', top: 6, insetInlineEnd: 6, width: 28, height: 28, borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >×</button>
          </div>
        ))}
        <label style={{ aspectRatio: '16/9', border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 8, color: 'var(--text-muted)', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
          <span style={{ fontSize: 32 }}>+</span>
          {uploading ? t('جاري...', 'Uploading...') : t('إضافة صورة', 'Add Image')}
          <input type="file" accept="image/*" onChange={uploadHero} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
}

function LogoSec() {
  const { data, setData, t, lang } = useApp();
  const ls = data.logoSettings;
  const sn = data.siteName;
  const [uploading, setUploading] = useState(false);

  const update = (partial: Partial<typeof ls>) => setData({ ...data, logoSettings: { ...ls, ...partial } });
  const updateName = (partial: Partial<typeof sn>) => setData({ ...data, siteName: { ...sn, ...partial } });

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.9 });
      update({ url });
    } catch { }
    setUploading(false);
  };

  const shapeRadius = ls.shape === 'circle' ? '50%' : ls.shape === 'rounded' ? '14px' : '0px';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
      <div>
        <SectionCard title={t('الشعار', 'Logo')}>
          <label style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 10, border: '2px dashed var(--border)', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: 14, marginBottom: 16 }}>
            {uploading ? t('جاري...', 'Uploading...') : t('رفع الشعار', 'Upload Logo')}
            <input type="file" accept="image/*" onChange={uploadLogo} style={{ display: 'none' }} />
          </label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {(['circle', 'rounded', 'square'] as const).map((s) => (
              <button key={s} onClick={() => update({ shape: s })} style={{ padding: '6px 14px', borderRadius: 8, border: `2px solid ${ls.shape === s ? 'var(--primary)' : 'var(--border)'}`, background: ls.shape === s ? 'var(--primary-light)' : 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Jost,sans-serif' }}>{s}</button>
            ))}
          </div>
          <SliderInput label={t('حجم في الشريط العلوي', 'Navbar Size')} value={ls.navSize} onChange={(v) => update({ navSize: v })} min={28} max={80} unit="px" />
          <SliderInput label={t('حجم في التذييل', 'Footer Size')} value={ls.footerSize} onChange={(v) => update({ footerSize: v })} min={28} max={80} unit="px" />
          <SliderInput label={t('مقياس الصورة الداخلي', 'Inner Scale')} value={ls.innerScale} onChange={(v) => update({ innerScale: v })} min={50} max={150} unit="%" />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: 14 }}>
              <input type="checkbox" checked={ls.showInNav} onChange={(e) => update({ showInNav: e.target.checked })} />
              {t('ظاهر في الشريط', 'Show in Navbar')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: 14 }}>
              <input type="checkbox" checked={ls.showInFooter} onChange={(e) => update({ showInFooter: e.target.checked })} />
              {t('ظاهر في التذييل', 'Show in Footer')}
            </label>
          </div>
        </SectionCard>
        <SectionCard title={t('اسم الموقع', 'Site Name')}>
          <Input label={t('الاسم بالعربي', 'Name AR')} value={sn.ar} onChange={(v) => updateName({ ar: v })} />
          <Input label={t('الاسم بالإنجليزي', 'Name EN')} value={sn.en} onChange={(v) => updateName({ en: v })} />
          <Input label={t('الوصف الفرعي', 'Subtitle')} value={sn.subtitle} onChange={(v) => updateName({ subtitle: v })} />
        </SectionCard>
      </div>
      {/* Live preview */}
      <div>
        <div style={{ position: 'sticky', top: 90 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Jost,sans-serif' }}>{t('معاينة', 'Preview')}</div>
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {ls.url && (
              <div style={{ width: ls.navSize, height: ls.navSize, borderRadius: shapeRadius, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                <img src={ls.url} alt="" style={{ width: `${ls.innerScale}%`, height: `${ls.innerScale}%`, objectFit: 'cover' }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>{lang === 'ar' ? sn.ar : sn.en}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>{sn.subtitle}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutSec() {
  const { data, setData, t, lang } = useApp();
  const ab = data.about;
  const upd = (lang2: 'ar' | 'en', field: 'history' | 'mission' | 'vision', val: string) =>
    setData({ ...data, about: { ...ab, [lang2]: { ...ab[lang2], [field]: val } } });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, fontFamily: 'Cairo,sans-serif', color: 'var(--primary)' }}>🇸🇦 عربي</h3>
        <Textarea label="التاريخ والنشأة" value={ab.ar.history} onChange={(v) => upd('ar', 'history', v)} />
        <Textarea label="الرسالة" value={ab.ar.mission} onChange={(v) => upd('ar', 'mission', v)} />
        <Textarea label="الرؤية" value={ab.ar.vision} onChange={(v) => upd('ar', 'vision', v)} />
      </div>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, fontFamily: 'Jost,sans-serif', color: 'var(--primary)' }}>🇬🇧 English</h3>
        <Textarea label="History" value={ab.en.history} onChange={(v) => upd('en', 'history', v)} />
        <Textarea label="Mission" value={ab.en.mission} onChange={(v) => upd('en', 'mission', v)} />
        <Textarea label="Vision" value={ab.en.vision} onChange={(v) => upd('en', 'vision', v)} />
      </div>
    </div>
  );
}

function GroupsSec() {
  const { data, setData, t, lang } = useApp();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
      {data.groups.map((g) => (
        <SectionCard key={g.id} title={`${g.emoji} ${lang === 'ar' ? g.nameAr : g.nameEn}`}>
          <Input label={t('الاسم بالعربي', 'Name AR')} value={g.nameAr} onChange={(v) => setData({ ...data, groups: data.groups.map((x) => x.id === g.id ? { ...x, nameAr: v } : x) })} />
          <Input label={t('الاسم بالإنجليزي', 'Name EN')} value={g.nameEn} onChange={(v) => setData({ ...data, groups: data.groups.map((x) => x.id === g.id ? { ...x, nameEn: v } : x) })} />
          <Textarea label={t('الوصف بالعربي', 'Description AR')} value={g.descriptionAr} onChange={(v) => setData({ ...data, groups: data.groups.map((x) => x.id === g.id ? { ...x, descriptionAr: v } : x) })} />
          <Textarea label={t('الوصف بالإنجليزي', 'Description EN')} value={g.descriptionEn} onChange={(v) => setData({ ...data, groups: data.groups.map((x) => x.id === g.id ? { ...x, descriptionEn: v } : x) })} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, fontFamily: 'Cairo,sans-serif', fontWeight: 600 }}>{t('اللون', 'Color')}</label>
            <input type="color" value={g.color} onChange={(e) => setData({ ...data, groups: data.groups.map((x) => x.id === g.id ? { ...x, color: e.target.value } : x) })} style={{ width: 40, height: 32, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }} />
            <span style={{ fontSize: 13, fontFamily: 'Jost,sans-serif', color: 'var(--text-muted)' }}>{g.color}</span>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function LeadersSec() {
  const { data, setData, t, lang } = useApp();
  const [editing, setEditing] = useState<(Leader & { _new?: boolean }) | null>(null);
  const [uploading, setUploading] = useState(false);

  const blank: Leader & { _new: boolean } = { id: '', nameAr: '', nameEn: '', photo: '', role: '', roleEn: '', groupId: data.groups[0]?.id ?? '', _new: true };

  const save = (l: Leader) => {
    const isNew = !data.leaders.find((x) => x.id === l.id);
    const leaders = isNew ? [...data.leaders, { ...l, id: `l_${Date.now()}` }] : data.leaders.map((x) => x.id === l.id ? l : x);
    setData({ ...data, leaders });
    setEditing(null);
  };

  const del = (id: string) => { if (confirm(t('حذف هذا القائد؟', 'Delete this leader?'))) setData({ ...data, leaders: data.leaders.filter((l) => l.id !== id) }); };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try { const url = await compressImage(file, { maxWidth: 600, maxHeight: 600 }); setEditing({ ...editing, photo: url }); } catch { }
    setUploading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setEditing(blank)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
          + {t('إضافة قائد', 'Add Leader')}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {data.leaders.map((l) => {
          const group = data.groups.find((g) => g.id === l.groupId);
          return (
            <div key={l.id} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ height: 120, background: 'var(--surface-2)', position: 'relative' }}>
                {l.photo ? <img src={l.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎖️</div>}
                {group && <div style={{ position: 'absolute', top: 8, insetInlineStart: 8, padding: '2px 8px', borderRadius: 100, background: group.color, color: '#fff', fontSize: 11, fontWeight: 700 }}>{group.emoji} {lang === 'ar' ? group.nameAr : group.nameEn}</div>}
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{lang === 'ar' ? l.nameAr : l.nameEn}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', marginBottom: 10 }}>{lang === 'ar' ? l.role : l.roleEn}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(l)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: 'var(--primary)', fontWeight: 600 }}>{t('تعديل', 'Edit')}</button>
                  <button onClick={() => del(l.id)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: '#dc2626', fontWeight: 600 }}>{t('حذف', 'Delete')}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 20, color: 'var(--primary)' }}>{t('القائد', 'Leader')}</h3>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 10px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {editing.photo ? <img src={editing.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>🎖️</span>}
              </div>
              <label style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif' }}>
                {uploading ? t('جاري...', 'Uploading...') : t('رفع صورة', 'Upload Photo')}
                <input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: 'none' }} />
              </label>
            </div>
            <Input label={t('الاسم بالعربي', 'Name AR')} value={editing.nameAr} onChange={(v) => setEditing({ ...editing, nameAr: v })} />
            <Input label={t('الاسم بالإنجليزي', 'Name EN')} value={editing.nameEn} onChange={(v) => setEditing({ ...editing, nameEn: v })} />
            <Input label={t('الدور بالعربي', 'Role AR')} value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })} />
            <Input label={t('الدور بالإنجليزي', 'Role EN')} value={editing.roleEn} onChange={(v) => setEditing({ ...editing, roleEn: v })} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Cairo,sans-serif' }}>{t('الفرقة', 'Group')}</label>
              <select value={editing.groupId} onChange={(e) => setEditing({ ...editing, groupId: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
                <option value="">{t('عام', 'General')}</option>
                {data.groups.map((g) => <option key={g.id} value={g.id}>{lang === 'ar' ? g.nameAr : g.nameEn}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => save(editing)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{t('حفظ', 'Save')}</button>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>{t('إلغاء', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivitiesSec() {
  const { data, setData, t, lang } = useApp();
  const [editing, setEditing] = useState<Activity | null>(null);
  const [uploading, setUploading] = useState(false);

  const blank: Activity = { id: '', nameAr: '', nameEn: '', photo: '', date: '', descriptionAr: '', descriptionEn: '', media: [] };

  const save = (a: Activity) => {
    const isNew = !data.activities.find((x) => x.id === a.id);
    setData({ ...data, activities: isNew ? [...data.activities, { ...a, id: `a_${Date.now()}` }] : data.activities.map((x) => x.id === a.id ? a : x) });
    setEditing(null);
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try { const url = await compressImage(file, { maxWidth: 1200 }); setEditing({ ...editing, photo: url }); } catch { }
    setUploading(false);
  };

  const addMediaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const files = Array.from(e.target.files ?? []);
    setUploading(true);
    try {
      const newMedia: ActivityMedia[] = [];
      for (const file of files) {
        const isVideo = file.type.startsWith('video/');
        const id = `m_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        if (isVideo) {
          let url = '';
          let thumb = '';
          try { thumb = await getVideoThumbnail(file); } catch { }
          if (isSupabaseConfigured()) {
            const pu = await uploadToSupabase(file, 'videos');
            if (pu) {
              url = pu;
            } else {
              // Supabase upload failed — fall back to IndexedDB
              await storeVideo(id, file);
            }
          } else {
            await storeVideo(id, file);
          }
          newMedia.push({ id, type: 'video', url, thumb, caption: file.name });
        } else {
          const url = await compressImage(file, { maxWidth: 1200 });
          const thumb = await compressImage(file, { maxWidth: 200, maxHeight: 200 });
          newMedia.push({ id, type: 'image', url, thumb, caption: '' });
        }
      }
      setEditing({ ...editing, media: [...editing.media, ...newMedia] });
    } catch { }
    setUploading(false);
  };

  return (
    <div>
      <button onClick={() => setEditing(blank)} style={{ marginBottom: 20, padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
        + {t('إضافة نشاط', 'Add Activity')}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {data.activities.map((a) => (
          <div key={a.id} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ height: 120, background: 'var(--surface-2)' }}>
              {a.photo ? <img src={a.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>⚡</div>}
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif', marginBottom: 4 }}>{lang === 'ar' ? a.nameAr : a.nameEn}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif', marginBottom: 10 }}>{a.date} · {a.media.length} {t('وسائط', 'media')}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(a)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--primary)', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{t('تعديل', 'Edit')}</button>
                <button onClick={() => { if (confirm(t('حذف؟', 'Delete?'))) setData({ ...data, activities: data.activities.filter((x) => x.id !== a.id) }); }} style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{t('حذف', 'Delete')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 20, color: 'var(--primary)' }}>{t('النشاط', 'Activity')}</h3>
            <Input label={t('الاسم بالعربي', 'Name AR')} value={editing.nameAr} onChange={(v) => setEditing({ ...editing, nameAr: v })} />
            <Input label={t('الاسم بالإنجليزي', 'Name EN')} value={editing.nameEn} onChange={(v) => setEditing({ ...editing, nameEn: v })} />
            <Input label={t('التاريخ', 'Date')} value={editing.date} onChange={(v) => setEditing({ ...editing, date: v })} type="date" />
            <Textarea label={t('الوصف بالعربي', 'Description AR')} value={editing.descriptionAr} onChange={(v) => setEditing({ ...editing, descriptionAr: v })} />
            <Textarea label={t('الوصف بالإنجليزي', 'Description EN')} value={editing.descriptionEn} onChange={(v) => setEditing({ ...editing, descriptionEn: v })} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>{t('صورة الغلاف', 'Cover Photo')}</label>
              <label style={{ display: 'inline-block', padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif' }}>
                {uploading ? t('جاري...', 'Uploading...') : t('رفع صورة', 'Upload')}
                <input type="file" accept="image/*" onChange={uploadPhoto} style={{ display: 'none' }} />
              </label>
              {editing.photo && <img src={editing.photo} alt="" style={{ display: 'block', marginTop: 8, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>{t('وسائط إضافية', 'Additional Media')}</label>
              <label style={{ display: 'inline-block', padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif' }}>
                {t('إضافة صور/فيديو', 'Add Images/Video')}
                <input type="file" accept="image/*,video/*" multiple onChange={addMediaFile} style={{ display: 'none' }} />
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {editing.media.map((m) => (
                  <div key={m.id} style={{ position: 'relative', width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                    {m.thumb ? <img src={m.thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{m.type === 'video' ? '🎬' : '🖼️'}</div>}
                    <button onClick={() => setEditing({ ...editing, media: editing.media.filter((x) => x.id !== m.id) })} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => save(editing)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{t('حفظ', 'Save')}</button>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>{t('إلغاء', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GallerySec() {
  const { data, setData, t } = useApp();
  const [uploading, setUploading] = useState(false);

  const addImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setUploading(true);
    try {
      const newItems: GalleryItem[] = [];
      for (const f of files) {
        const url = await compressImage(f, { maxWidth: 1200 });
        newItems.push({ id: `g_${Date.now()}_${Math.random().toString(36).slice(2)}`, type: 'image', url, captionAr: '', captionEn: '' });
      }
      setData({ ...data, gallery: [...data.gallery, ...newItems] });
    } catch { }
    setUploading(false);
  };

  const addUrl = (type: 'youtube' | 'instagram') => {
    const url = prompt(type === 'youtube' ? 'YouTube URL:' : 'Instagram URL:');
    if (!url) return;
    setData({ ...data, gallery: [...data.gallery, { id: `g_${Date.now()}`, type, url, captionAr: '', captionEn: '' }] });
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <label style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
          {uploading ? t('جاري...', 'Uploading...') : `+ ${t('رفع صور', 'Upload Images')}`}
          <input type="file" accept="image/*" multiple onChange={addImage} style={{ display: 'none' }} />
        </label>
        <button onClick={() => addUrl('youtube')} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>+ YouTube</button>
        <button onClick={() => addUrl('instagram')} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>+ Instagram</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
        {data.gallery.map((item) => (
          <div key={item.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', background: 'var(--surface-2)' }}>
            {item.type === 'image' ? (
              <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: item.type === 'youtube' ? '#ff0000' : 'linear-gradient(135deg,#fd5949,#d6249f)' }}>
                {item.type === 'youtube' ? '▶' : '📸'}
              </div>
            )}
            <button onClick={() => setData({ ...data, gallery: data.gallery.filter((g) => g.id !== item.id) })} style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', background: 'rgba(220,38,38,0.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsSec() {
  const { data, setData, t, lang } = useApp();
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const blank: NewsItem = { id: '', titleAr: '', titleEn: '', contentAr: '', contentEn: '', image: '', date: new Date().toISOString().split('T')[0], published: false };

  const save = (n: NewsItem) => {
    const isNew = !data.news.find((x) => x.id === n.id);
    setData({ ...data, news: isNew ? [...data.news, { ...n, id: `n_${Date.now()}` }] : data.news.map((x) => x.id === n.id ? n : x) });
    setEditing(null);
  };

  return (
    <div>
      <button onClick={() => setEditing(blank)} style={{ marginBottom: 20, padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
        + {t('إضافة خبر', 'Add News')}
      </button>
      {data.news.sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
        <div key={n.id} style={{ background: 'var(--surface)', borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {n.image && <img src={n.image} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} loading="lazy" />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lang === 'ar' ? n.titleAr : n.titleEn}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>{n.date}</div>
          </div>
          <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: n.published ? '#dcfce7' : '#fee2e2', color: n.published ? '#16a34a' : '#dc2626' }}>
            {n.published ? t('منشور', 'Published') : t('مسودة', 'Draft')}
          </span>
          <button onClick={() => setEditing(n)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: 'var(--primary)', fontWeight: 600 }}>{t('تعديل', 'Edit')}</button>
          <button onClick={() => { if (confirm(t('حذف؟', 'Delete?'))) setData({ ...data, news: data.news.filter((x) => x.id !== n.id) }); }} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: '#dc2626', fontWeight: 600 }}>{t('حذف', 'Delete')}</button>
        </div>
      ))}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 20, color: 'var(--primary)' }}>{t('الخبر', 'News Item')}</h3>
            <Input label={t('العنوان بالعربي', 'Title AR')} value={editing.titleAr} onChange={(v) => setEditing({ ...editing, titleAr: v })} />
            <Input label={t('العنوان بالإنجليزي', 'Title EN')} value={editing.titleEn} onChange={(v) => setEditing({ ...editing, titleEn: v })} />
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('المحتوى بالعربي', 'Content AR')}</label>
              <RichEditor value={editing.contentAr} onChange={(v) => setEditing({ ...editing, contentAr: v })} placeholder={t('اكتب محتوى الخبر...', 'Write news content...')} dir="rtl" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('المحتوى بالإنجليزي', 'Content EN')}</label>
              <RichEditor value={editing.contentEn} onChange={(v) => setEditing({ ...editing, contentEn: v })} placeholder="Write news content..." dir="ltr" />
            </div>
            <Input label={t('التاريخ', 'Date')} value={editing.date} onChange={(v) => setEditing({ ...editing, date: v })} type="date" />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>{t('الصورة', 'Image')}</label>
              <label style={{ display: 'inline-block', padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif' }}>
                {uploading ? t('جاري...', 'Uploading...') : t('رفع صورة', 'Upload')}
                <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploading(true); try { const url = await compressImage(f, { maxWidth: 1200 }); setEditing({ ...editing, image: url }); } catch { } setUploading(false); }} style={{ display: 'none' }} />
              </label>
              {editing.image && <img src={editing.image} alt="" style={{ display: 'block', marginTop: 8, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: 14, marginBottom: 20 }}>
              <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              {t('نشر الخبر', 'Publish')}
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => save(editing)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{t('حفظ', 'Save')}</button>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>{t('إلغاء', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AchievementsSec() {
  const { data, setData, t, lang } = useApp();
  const [editing, setEditing] = useState<Achievement | null>(null);
  const blank: Achievement = { id: '', titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', icon: '🏆', year: String(new Date().getFullYear()) };

  const save = (a: Achievement) => {
    const isNew = !data.achievements.find((x) => x.id === a.id);
    setData({ ...data, achievements: isNew ? [...data.achievements, { ...a, id: `ach_${Date.now()}` }] : data.achievements.map((x) => x.id === a.id ? a : x) });
    setEditing(null);
  };

  return (
    <div>
      <button onClick={() => setEditing(blank)} style={{ marginBottom: 20, padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
        + {t('إضافة إنجاز', 'Add Achievement')}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
        {data.achievements.map((a) => (
          <div key={a.id} style={{ background: 'var(--surface)', borderRadius: 14, padding: '20px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{a.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif', marginBottom: 4 }}>{lang === 'ar' ? a.titleAr : a.titleEn}</div>
            {a.year && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif', marginBottom: 12 }}>{a.year}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditing(a)} style={{ flex: 1, padding: '5px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--primary)', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{t('تعديل', 'Edit')}</button>
              <button onClick={() => { if (confirm(t('حذف؟', 'Delete?'))) setData({ ...data, achievements: data.achievements.filter((x) => x.id !== a.id) }); }} style={{ flex: 1, padding: '5px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{t('حذف', 'Delete')}</button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 20, color: 'var(--primary)' }}>{t('الإنجاز', 'Achievement')}</h3>
            <Input label={t('الأيقونة (إيموجي)', 'Icon (emoji)')} value={editing.icon} onChange={(v) => setEditing({ ...editing, icon: v })} />
            <Input label={t('السنة', 'Year')} value={editing.year} onChange={(v) => setEditing({ ...editing, year: v })} />
            <Input label={t('العنوان بالعربي', 'Title AR')} value={editing.titleAr} onChange={(v) => setEditing({ ...editing, titleAr: v })} />
            <Input label={t('العنوان بالإنجليزي', 'Title EN')} value={editing.titleEn} onChange={(v) => setEditing({ ...editing, titleEn: v })} />
            <Textarea label={t('الوصف بالعربي', 'Description AR')} value={editing.descriptionAr} onChange={(v) => setEditing({ ...editing, descriptionAr: v })} />
            <Textarea label={t('الوصف بالإنجليزي', 'Description EN')} value={editing.descriptionEn} onChange={(v) => setEditing({ ...editing, descriptionEn: v })} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => save(editing)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{t('حفظ', 'Save')}</button>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>{t('إلغاء', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarSec() {
  const { data, setData, t, lang } = useApp();
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const blank: CalendarEvent = { id: '', titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', date: '', time: '', groupId: '' };

  const save = (ev: CalendarEvent) => {
    const isNew = !data.events.find((x) => x.id === ev.id);
    setData({ ...data, events: isNew ? [...data.events, { ...ev, id: `ev_${Date.now()}` }] : data.events.map((x) => x.id === ev.id ? ev : x) });
    setEditing(null);
  };

  return (
    <div>
      <button onClick={() => setEditing(blank)} style={{ marginBottom: 20, padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
        + {t('إضافة فعالية', 'Add Event')}
      </button>
      {data.events.sort((a, b) => b.date.localeCompare(a.date)).map((ev) => {
        const group = data.groups.find((g) => g.id === ev.groupId);
        return (
          <div key={ev.id} style={{ background: 'var(--surface)', borderRadius: 12, padding: '14px 18px', marginBottom: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, borderInlineStart: `4px solid ${group?.color ?? 'var(--secondary)'}` }}>
            <div style={{ minWidth: 50 }}>
              <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Playfair Display,serif', color: group?.color ?? 'var(--primary)' }}>{ev.date ? new Date(ev.date).getDate() : '?'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>{ev.date ? new Date(ev.date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en', { month: 'short', year: 'numeric' }) : ''}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{lang === 'ar' ? ev.titleAr : ev.titleEn}</div>
              {ev.time && <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>⏰ {ev.time}</div>}
            </div>
            <button onClick={() => setEditing(ev)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--primary)', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{t('تعديل', 'Edit')}</button>
            <button onClick={() => { if (confirm(t('حذف؟', 'Delete?'))) setData({ ...data, events: data.events.filter((x) => x.id !== ev.id) }); }} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{t('حذف', 'Delete')}</button>
          </div>
        );
      })}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 20, color: 'var(--primary)' }}>{t('الفعالية', 'Event')}</h3>
            <Input label={t('العنوان بالعربي', 'Title AR')} value={editing.titleAr} onChange={(v) => setEditing({ ...editing, titleAr: v })} />
            <Input label={t('العنوان بالإنجليزي', 'Title EN')} value={editing.titleEn} onChange={(v) => setEditing({ ...editing, titleEn: v })} />
            <Textarea label={t('الوصف بالعربي', 'Description AR')} value={editing.descriptionAr} onChange={(v) => setEditing({ ...editing, descriptionAr: v })} />
            <Textarea label={t('الوصف بالإنجليزي', 'Description EN')} value={editing.descriptionEn} onChange={(v) => setEditing({ ...editing, descriptionEn: v })} />
            <Input label={t('التاريخ', 'Date')} value={editing.date} onChange={(v) => setEditing({ ...editing, date: v })} type="date" />
            <Input label={t('الوقت', 'Time')} value={editing.time} onChange={(v) => setEditing({ ...editing, time: v })} type="time" />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>{t('الفرقة', 'Group')}</label>
              <select value={editing.groupId} onChange={(e) => setEditing({ ...editing, groupId: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
                <option value="">{t('عام', 'General')}</option>
                {data.groups.map((g) => <option key={g.id} value={g.id}>{lang === 'ar' ? g.nameAr : g.nameEn}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => save(editing)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{t('حفظ', 'Save')}</button>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>{t('إلغاء', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaSec() {
  const { data, setData, t } = useApp();
  const ms = data.mediaSettings;
  const upd = (partial: Partial<typeof ms>) => setData({ ...data, mediaSettings: { ...ms, ...partial } });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24 }}>
      <div>
        <SectionCard title={t('① الهيرو', '① Hero')}>
          <SliderInput label={t('ارتفاع الهيرو', 'Hero Height')} value={ms.heroHeight} onChange={(v) => upd({ heroHeight: v })} min={50} max={100} unit="vh" />
          <SliderInput label={t('تعتيم الهيرو', 'Hero Overlay')} value={Math.round(ms.heroOverlayOpacity * 100)} onChange={(v) => upd({ heroOverlayOpacity: v / 100 })} min={0} max={100} unit="%" />
        </SectionCard>
        <SectionCard title={t('② البطاقات', '② Cards')}>
          <SliderInput label={t('ارتفاع صورة البطاقة', 'Card Image Height')} value={ms.cardImageHeight} onChange={(v) => upd({ cardImageHeight: v })} min={100} max={320} unit="px" />
          <SliderInput label={t('انحناء حواف البطاقة', 'Card Border Radius')} value={ms.cardBorderRadius} onChange={(v) => upd({ cardBorderRadius: v })} min={0} max={28} unit="px" />
          <SliderInput label={t('سماكة إطار البطاقة', 'Card Border Width')} value={ms.cardBorderWidth} onChange={(v) => upd({ cardBorderWidth: v })} min={0} max={6} unit="px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <label style={{ fontSize: 13, fontFamily: 'Cairo,sans-serif', fontWeight: 600 }}>{t('لون الإطار', 'Border Color')}</label>
            <input type="color" value={ms.cardBorderColor} onChange={(e) => upd({ cardBorderColor: e.target.value })} style={{ width: 40, height: 32, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {(['cover', 'contain'] as const).map((f) => (
              <button key={f} onClick={() => upd({ imageFit: f })} style={{ padding: '7px 18px', borderRadius: 8, border: `2px solid ${ms.imageFit === f ? 'var(--primary)' : 'var(--border)'}`, background: ms.imageFit === f ? 'var(--primary-light)' : 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Jost,sans-serif' }}>{f}</button>
            ))}
          </div>
        </SectionCard>
        <SectionCard title={t('③ صور الكشافين', '③ Scout Photos')}>
          <SliderInput label={t('حجم صورة الكشاف', 'Scout Photo Size')} value={ms.scoutPhotoSize} onChange={(v) => upd({ scoutPhotoSize: v })} min={44} max={130} unit="px" />
        </SectionCard>
        <SectionCard title={t('④ المعرض', '④ Gallery')}>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['cover', 'contain', 'natural'] as const).map((f) => (
              <button key={f} onClick={() => upd({ galleryFit: f })} style={{ padding: '7px 18px', borderRadius: 8, border: `2px solid ${ms.galleryFit === f ? 'var(--primary)' : 'var(--border)'}`, background: ms.galleryFit === f ? 'var(--primary-light)' : 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Jost,sans-serif' }}>{f}</button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Live preview */}
      <div>
        <div style={{ position: 'sticky', top: 90 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Jost,sans-serif' }}>{t('معاينة', 'Preview')}</div>
          <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'Jost,sans-serif' }}>{t('بطاقة', 'Card')} preview</div>
            <div style={{ borderRadius: ms.cardBorderRadius, border: `${ms.cardBorderWidth}px solid ${ms.cardBorderColor}`, overflow: 'hidden', background: 'var(--surface-2)' }}>
              <div style={{ height: Math.min(ms.cardImageHeight, 120), background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🏕️</div>
              <div style={{ padding: 10, fontSize: 12, fontFamily: 'Cairo,sans-serif' }}>{t('اسم النشاط', 'Activity Name')}</div>
            </div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'Jost,sans-serif' }}>{t('صورة الكشاف', 'Scout photo')}</div>
            <div style={{ width: ms.scoutPhotoSize, height: ms.scoutPhotoSize, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(ms.scoutPhotoSize * 0.4) }}>👤</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorsSec() {
  const { data, setData, t } = useApp();
  const presets = [
    { name: t('الافتراضي', 'Default'), primary: '#1B3A6B', secondary: '#5BA4CF', bgColor: '#F7F4EF' },
    { name: t('الأخضر', 'Green'), primary: '#065F46', secondary: '#34D399', bgColor: '#F0FDF4' },
    { name: t('الأحمر', 'Red'), primary: '#7F1D1D', secondary: '#F87171', bgColor: '#FFF5F5' },
    { name: t('البنفسجي', 'Purple'), primary: '#4C1D95', secondary: '#A78BFA', bgColor: '#F5F3FF' },
    { name: t('البرتقالي', 'Orange'), primary: '#7C2D12', secondary: '#FB923C', bgColor: '#FFF7ED' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => setData({ ...data, siteColors: { primary: p.primary, secondary: p.secondary, bgColor: p.bgColor } })}
            style={{ padding: '8px 20px', borderRadius: 100, border: '2px solid transparent', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif', fontWeight: 600, background: p.primary, color: '#fff', transition: 'transform 0.15s' }}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[
          { label: t('اللون الرئيسي', 'Primary Color'), key: 'primary' as const },
          { label: t('اللون الثانوي', 'Secondary Color'), key: 'secondary' as const },
          { label: t('لون الخلفية', 'Background'), key: 'bgColor' as const },
        ].map((c) => (
          <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', padding: '14px 18px', borderRadius: 14, border: '1px solid var(--border)' }}>
            <input type="color" value={data.siteColors[c.key]} onChange={(e) => setData({ ...data, siteColors: { ...data.siteColors, [c.key]: e.target.value } })} style={{ width: 48, height: 40, borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{c.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>{data.siteColors[c.key]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live color preview strip */}
      <div style={{ marginTop: 24, height: 8, borderRadius: 100, background: `linear-gradient(to right, ${data.siteColors.primary}, ${data.siteColors.secondary})` }} />
    </div>
  );
}

function SettingsSec() {
  const { data, setData, t } = useApp();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <Input label={t('رقم واتساب', 'WhatsApp Number')} value={data.whatsapp} onChange={(v) => setData({ ...data, whatsapp: v })} placeholder="+96512345678" />
      <Input label={t('رابط إنستغرام', 'Instagram URL')} value={data.instagram} onChange={(v) => setData({ ...data, instagram: v })} />
      <Input label={t('رابط المدرسة', 'School URL')} value={data.schoolUrl} onChange={(v) => setData({ ...data, schoolUrl: v })} />
      <SectionCard title={t('حقول الكشاف', 'Scout Fields')}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: 14 }}>
          <input type="checkbox" checked={data.scoutFieldsConfig.grade} onChange={(e) => setData({ ...data, scoutFieldsConfig: { ...data.scoutFieldsConfig, grade: e.target.checked } })} />
          {t('إظهار حقل الصف الدراسي', 'Show Grade Field')}
        </label>
      </SectionCard>
    </div>
  );
}

function AdminsSec() {
  const { data, setData, currentUser, t } = useApp();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });

  const addAdmin = () => {
    if (!form.username || !form.password) return;
    setData({ ...data, admins: [...data.admins, { ...form, isMain: false }] });
    setForm({ username: '', password: '' });
    setAdding(false);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {data.admins.map((admin, i) => (
          <div key={i} style={{ background: 'var(--surface)', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{admin.username}</div>
              {admin.isMain && <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, fontFamily: 'Jost,sans-serif' }}>Main Admin</span>}
            </div>
            {!admin.isMain && admin.username !== currentUser?.username && (
              <button
                onClick={() => { if (confirm(t('حذف هذا المدير؟', 'Delete this admin?'))) setData({ ...data, admins: data.admins.filter((_, j) => j !== i) }); }}
                style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}
              >
                {t('حذف', 'Delete')}
              </button>
            )}
          </div>
        ))}
      </div>
      {adding ? (
        <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 20, border: '1px solid var(--border)' }}>
          <Input label={t('اسم المستخدم', 'Username')} value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <Input label={t('كلمة المرور', 'Password')} value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={addAdmin} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{t('إضافة', 'Add')}</button>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>{t('إلغاء', 'Cancel')}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
          + {t('إضافة مدير', 'Add Admin')}
        </button>
      )}
    </div>
  );
}

function ScoutOfMonthSec() {
  const { data, setData, t, lang } = useApp();
  const [activeGroup, setActiveGroup] = useState(data.groups[0]?.id ?? '');
  const [form, setForm] = useState({ scoutId: '', month: '', monthEn: '', reasonAr: '', reasonEn: '' });

  const current = data.scoutsOfMonth.find((s) => s.groupId === activeGroup);
  const group = data.groups.find((g) => g.id === activeGroup);
  const groupScouts = data.scouts.filter((s) => s.groupId === activeGroup && s.visible);

  const save = () => {
    const rest = data.scoutsOfMonth.filter((s) => s.groupId !== activeGroup);
    setData({ ...data, scoutsOfMonth: [...rest, { groupId: activeGroup, ...form }] });
  };

  const remove = () => setData({ ...data, scoutsOfMonth: data.scoutsOfMonth.filter((s) => s.groupId !== activeGroup) });

  React.useEffect(() => {
    if (current) setForm({ scoutId: current.scoutId, month: current.month, monthEn: current.monthEn, reasonAr: current.reasonAr, reasonEn: current.reasonEn });
    else setForm({ scoutId: '', month: '', monthEn: '', reasonAr: '', reasonEn: '' });
  }, [activeGroup]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {data.groups.map((g) => (
          <button key={g.id} onClick={() => setActiveGroup(g.id)} style={{ padding: '8px 18px', borderRadius: 100, border: `2px solid ${activeGroup === g.id ? g.color : 'var(--border)'}`, background: activeGroup === g.id ? g.color : 'var(--surface)', color: activeGroup === g.id ? '#fff' : 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
            {g.emoji} {lang === 'ar' ? g.nameAr : g.nameEn}
          </button>
        ))}
      </div>
      {group && (
        <div style={{ maxWidth: 480 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Cairo,sans-serif' }}>{t('الكشاف', 'Scout')}</label>
            <select value={form.scoutId} onChange={(e) => setForm({ ...form, scoutId: e.target.value })} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
              <option value="">{t('اختر كشافاً', 'Select Scout')}</option>
              {groupScouts.map((s) => <option key={s.id} value={s.id}>{lang === 'ar' ? s.nameAr : s.nameEn}</option>)}
            </select>
          </div>
          <Input label={t('الشهر بالعربي', 'Month AR')} value={form.month} onChange={(v) => setForm({ ...form, month: v })} placeholder={t('أبريل', 'April')} />
          <Input label={t('الشهر بالإنجليزي', 'Month EN')} value={form.monthEn} onChange={(v) => setForm({ ...form, monthEn: v })} placeholder="April" />
          <Textarea label={t('السبب بالعربي', 'Reason AR')} value={form.reasonAr} onChange={(v) => setForm({ ...form, reasonAr: v })} />
          <Textarea label={t('السبب بالإنجليزي', 'Reason EN')} value={form.reasonEn} onChange={(v) => setForm({ ...form, reasonEn: v })} />
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={save} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{t('حفظ', 'Save')}</button>
            {current && <button onClick={remove} style={{ padding: '11px 18px', borderRadius: 12, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626', fontFamily: 'Cairo,sans-serif' }}>{t('إزالة', 'Remove')}</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function HomeVideosSec() {
  const { data, setData, t, lang } = useApp();
  const [uploading, setUploading] = useState(false);

  // ── Form state ───────────────────────────────────────────────
  type VideoForm = {
    /** Empty string = new video being added; non-empty = id of video being edited */
    id: string;
    isNew: boolean;
    type: 'youtube' | 'instagram' | 'upload';
    url: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
  };

  const emptyForm = (type: VideoForm['type']): VideoForm => ({
    id: '', isNew: true, type, url: '', titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '',
  });

  const [form, setForm] = useState<VideoForm | null>(null);

  const upd = (k: keyof VideoForm, v: string) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  // Open edit form pre-filled with existing video data
  const startEdit = (v: HomeVideo) => {
    setForm({
      id: v.id,
      isNew: false,
      type: v.type,
      url: v.url,
      titleAr: v.titleAr,
      titleEn: v.titleEn,
      descriptionAr: v.descriptionAr ?? '',
      descriptionEn: v.descriptionEn ?? '',
    });
  };

  // Commit the form — add new or update existing
  const saveForm = () => {
    if (!form) return;
    const video: HomeVideo = {
      id: form.isNew ? (form.id || `hv_${Date.now()}`) : form.id,
      type: form.type,
      url: form.url,
      titleAr: form.titleAr,
      titleEn: form.titleEn,
      descriptionAr: form.descriptionAr,
      descriptionEn: form.descriptionEn,
    };
    setData({
      ...data,
      homeVideos: form.isNew
        ? [...data.homeVideos, video]
        : data.homeVideos.map((v) => (v.id === video.id ? video : v)),
    });
    setForm(null);
  };

  // File upload — upload first, then show metadata form
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // allow same file to be re-selected if needed
    setUploading(true);
    try {
      const id = `hv_${Date.now()}`;
      let url = '';
      if (isSupabaseConfigured()) {
        const pu = await uploadToSupabase(file, 'videos');
        if (pu) {
          url = pu;
        } else {
          // Supabase upload failed — fall back to IndexedDB
          await storeVideo(id, file);
        }
      } else {
        await storeVideo(id, file);
      }
      // Open the metadata form with the pre-assigned id; user fills in titles/descriptions then saves
      setForm({ id, isNew: true, type: 'upload', url, titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '' });
    } catch { /* ignore */ }
    setUploading(false);
  };

  const btnStyle: React.CSSProperties = {
    padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)',
    background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif',
  };

  return (
    <div>
      {/* ── Add buttons — hidden while a form is open ── */}
      {!form && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => setForm(emptyForm('youtube'))} style={btnStyle}>+ YouTube</button>
          <button onClick={() => setForm(emptyForm('instagram'))} style={btnStyle}>+ Instagram</button>
          <label style={{ ...btnStyle, display: 'inline-flex', alignItems: 'center' }}>
            {uploading ? t('جاري الرفع…', 'Uploading…') : `+ ${t('رفع فيديو', 'Upload Video')}`}
            <input type="file" accept="video/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>
      )}

      {/* ── Add / Edit form ── */}
      {form && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 14, border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
          {/* Form heading */}
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif', color: 'var(--primary)', marginBottom: 14 }}>
            {!form.isNew
              ? t('تعديل الفيديو', 'Edit Video')
              : form.type === 'youtube'
                ? t('إضافة فيديو YouTube', 'Add YouTube Video')
                : form.type === 'instagram'
                  ? t('إضافة فيديو Instagram', 'Add Instagram Video')
                  : t('تفاصيل الفيديو المرفوع', 'Uploaded Video Details')}
          </div>

          {/* URL field — YouTube and Instagram only; upload URL is set automatically */}
          {form.type !== 'upload' && (
            <Input
              label={form.type === 'youtube' ? 'YouTube URL' : 'Instagram URL (post or reel)'}
              value={form.url}
              onChange={(v) => upd('url', v)}
              placeholder={
                form.type === 'youtube'
                  ? 'https://www.youtube.com/watch?v=...'
                  : 'https://www.instagram.com/p/... or /reel/...'
              }
            />
          )}

          {/* Upload status indicator */}
          {form.type === 'upload' && (
            <div style={{ fontSize: 12, fontFamily: 'Cairo,sans-serif', marginBottom: 12, color: form.url ? '#16a34a' : 'var(--text-muted)' }}>
              {form.url
                ? `✅ ${t('تم رفع الفيديو — أضف التفاصيل ثم احفظ', 'Video uploaded — add details then save')}`
                : `⏳ ${t('جاري الرفع…', 'Uploading…')}`}
            </div>
          )}

          {/* Metadata fields — 2-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label={t('العنوان بالعربي', 'Arabic Title')}       value={form.titleAr}       onChange={(v) => upd('titleAr', v)} />
            <Input label="English Title"                              value={form.titleEn}       onChange={(v) => upd('titleEn', v)} />
            <Input label={t('الوصف بالعربي', 'Arabic Description')}   value={form.descriptionAr} onChange={(v) => upd('descriptionAr', v)} />
            <Input label="English Description"                        value={form.descriptionEn} onChange={(v) => upd('descriptionEn', v)} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              onClick={saveForm}
              disabled={form.type !== 'upload' && !form.url.trim()}
              style={{
                padding: '9px 22px', borderRadius: 10, border: 'none',
                background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif',
                opacity: (form.type !== 'upload' && !form.url.trim()) ? 0.5 : 1,
              }}
            >
              {t('حفظ', 'Save')}
            </button>
            <button
              onClick={() => setForm(null)}
              style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}
            >
              {t('إلغاء', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ── Existing video cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {data.homeVideos.map((v) => (
          <div key={v.id} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {/* Thumbnail icon */}
            <div style={{ height: 130, background: v.type === 'instagram' ? 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' : '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
              {v.type === 'youtube' ? '▶' : v.type === 'instagram' ? '📸' : '🎬'}
            </div>
            {/* Title row */}
            <div style={{ padding: '10px 16px 4px', fontSize: 13, fontFamily: 'Cairo,sans-serif' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{v.type}</span>
              {' · '}
              <span style={{ color: 'var(--text-muted)' }}>
                {(lang === 'ar' ? v.titleAr : v.titleEn) || t('بلا عنوان', 'Untitled')}
              </span>
            </div>
            {/* Description preview (one line) */}
            {(v.descriptionAr || v.descriptionEn) && (
              <div style={{ padding: '0 16px 6px', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lang === 'ar' ? v.descriptionAr : v.descriptionEn}
              </div>
            )}
            {/* Actions */}
            <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
              <button
                onClick={() => startEdit(v)}
                style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--primary)', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}
              >
                {t('تعديل', 'Edit')}
              </button>
              <button
                onClick={() => setData({ ...data, homeVideos: data.homeVideos.filter((x) => x.id !== v.id) })}
                style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}
              >
                {t('حذف', 'Delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchiveSec() {
  const { data, setData, t, lang } = useApp();
  const [editing, setEditing] = useState<ArchiveYear | null>(null);
  const [uploading, setUploading] = useState(false);
  const blank: ArchiveYear = { id: '', year: String(new Date().getFullYear()), descriptionAr: '', descriptionEn: '', coverPhoto: '', items: [] };

  const save = (a: ArchiveYear) => {
    const isNew = !data.archive.find((x) => x.id === a.id);
    setData({ ...data, archive: isNew ? [...data.archive, { ...a, id: `ar_${Date.now()}` }] : data.archive.map((x) => x.id === a.id ? a : x) });
    setEditing(null);
  };

  return (
    <div>
      <button onClick={() => setEditing(blank)} style={{ marginBottom: 20, padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
        + {t('إضافة سنة', 'Add Year')}
      </button>
      {data.archive.sort((a, b) => b.year.localeCompare(a.year)).map((a) => (
        <div key={a.id} style={{ background: 'var(--surface)', borderRadius: 12, padding: '14px 18px', marginBottom: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', fontFamily: 'Playfair Display,serif', minWidth: 56 }}>{a.year}</div>
          <div style={{ flex: 1, fontFamily: 'Cairo,sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
            {lang === 'ar' ? a.descriptionAr : a.descriptionEn} · {a.items.length} {t('عنصر', 'items')}
          </div>
          <button onClick={() => setEditing(a)} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--primary)', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{t('تعديل', 'Edit')}</button>
          <button onClick={() => { if (confirm(t('حذف؟', 'Delete?'))) setData({ ...data, archive: data.archive.filter((x) => x.id !== a.id) }); }} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600, fontFamily: 'Cairo,sans-serif' }}>{t('حذف', 'Delete')}</button>
        </div>
      ))}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 20, color: 'var(--primary)' }}>{t('السنة الأرشيفية', 'Archive Year')}</h3>
            <Input label={t('السنة', 'Year')} value={editing.year} onChange={(v) => setEditing({ ...editing, year: v })} />
            <Textarea label={t('الوصف بالعربي', 'Description AR')} value={editing.descriptionAr} onChange={(v) => setEditing({ ...editing, descriptionAr: v })} />
            <Textarea label={t('الوصف بالإنجليزي', 'Description EN')} value={editing.descriptionEn} onChange={(v) => setEditing({ ...editing, descriptionEn: v })} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>{t('صورة الغلاف', 'Cover Photo')}</label>
              <label style={{ display: 'inline-block', padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif' }}>
                {uploading ? t('جاري...', 'Uploading...') : t('رفع صورة', 'Upload')}
                <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploading(true); try { const url = await compressImage(f, { maxWidth: 800 }); setEditing({ ...editing, coverPhoto: url }); } catch { } setUploading(false); }} style={{ display: 'none' }} />
              </label>
              {editing.coverPhoto && <img src={editing.coverPhoto} alt="" style={{ display: 'block', marginTop: 8, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => save(editing)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>{t('حفظ', 'Save')}</button>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>{t('إلغاء', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WELCOME POPUP SECTION ───────────────────────────────────
function WelcomeSec() {
  const { data, setData, t, lang } = useApp();
  const wp = data.welcomePopup;
  const upd = (patch: Partial<typeof wp>) => setData({ ...data, welcomePopup: { ...wp, ...patch } });
  const [uploading, setUploading] = useState(false);

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 700,
    fontSize: 13, fontFamily: 'Cairo,sans-serif', transition: 'all 0.2s',
    background: active ? 'var(--primary)' : 'var(--surface-2)',
    color: active ? '#fff' : 'var(--text-muted)',
  });

  return (
    <div>
      <SectionCard title={t('رسالة الترحيب المنبثقة', 'Welcome Popup Message')}>
        {/* Enable toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: wp.enabled ? 'var(--primary-light)' : 'var(--surface-2)', border: `1px solid ${wp.enabled ? 'var(--primary)' : 'var(--border)'}` }}>
          <span style={{ flex: 1, fontSize: 14, fontFamily: 'Cairo,sans-serif', fontWeight: 600, color: 'var(--text)' }}>
            {t('تفعيل رسالة الترحيب', 'Enable Welcome Popup')}
          </span>
          <button style={toggleStyle(!wp.enabled)} onClick={() => upd({ enabled: false })}>
            {t('معطّل', 'OFF')}
          </button>
          <button style={toggleStyle(wp.enabled)} onClick={() => upd({ enabled: true })}>
            {t('مفعّل', 'ON')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label={t('العنوان (عربي)', 'Title (Arabic)')} value={wp.titleAr} onChange={(v) => upd({ titleAr: v })} />
          <Input label={t('العنوان (إنجليزي)', 'Title (English)')} value={wp.titleEn} onChange={(v) => upd({ titleEn: v })} />
        </div>
        <Textarea label={t('النص (عربي)', 'Body (Arabic)')} value={wp.bodyAr} onChange={(v) => upd({ bodyAr: v })} />
        <Textarea label={t('النص (إنجليزي)', 'Body (English)')} value={wp.bodyEn} onChange={(v) => upd({ bodyEn: v })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label={t('نص الزر (عربي)', 'Button (Arabic)')} value={wp.btnTextAr} onChange={(v) => upd({ btnTextAr: v })} />
          <Input label={t('نص الزر (إنجليزي)', 'Button (English)')} value={wp.btnTextEn} onChange={(v) => upd({ btnTextEn: v })} />
        </div>

        {/* Delay */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase' }}>
            {t('تأخير الظهور (ثانية)', 'Show Delay (seconds)')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {[0.5, 1, 1.5, 2, 3, 5].map((s) => (
              <button key={s} onClick={() => upd({ delayMs: s * 1000 })} style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${wp.delayMs === s * 1000 ? 'var(--primary)' : 'var(--border)'}`, background: wp.delayMs === s * 1000 ? 'var(--primary-light)' : 'none', color: wp.delayMs === s * 1000 ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'Jost,sans-serif', fontWeight: 600 }}>
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Show once */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}>
            {t('إظهار مرة واحدة فقط لكل زيارة', 'Show once per session')}
          </span>
          <button onClick={() => upd({ showOnce: !wp.showOnce })} style={{ ...toggleStyle(wp.showOnce), padding: '4px 14px', fontSize: 12 }}>
            {wp.showOnce ? t('نعم', 'Yes') : t('لا', 'No')}
          </button>
        </div>

        {/* Optional image */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase' }}>
            {t('صورة اختيارية', 'Optional Image')}
          </label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{ padding: '7px 16px', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif', color: 'var(--text)' }}>
              {uploading ? t('جاري...', 'Uploading...') : t('رفع صورة', 'Upload Image')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return; setUploading(true);
                try { const { compressImage } = await import('@/lib/compress'); const url = await compressImage(f, { maxWidth: 800 }); upd({ image: url }); } catch {}
                setUploading(false);
              }} />
            </label>
            {wp.image && (
              <>
                <img src={wp.image} alt="" style={{ height: 48, borderRadius: 8, objectFit: 'cover' }} />
                <button onClick={() => upd({ image: '' })} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444' }}>✕ {t('حذف', 'Remove')}</button>
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginTop: 20, padding: 16, borderRadius: 12, border: '1px dashed var(--border)', background: 'var(--surface-2)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', marginBottom: 8 }}>
            {t('معاينة سريعة:', 'Quick Preview:')}
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '20px', maxWidth: 360, margin: '0 auto', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>⚜️</div>
            <div style={{ fontSize: 16, fontWeight: 800, textAlign: 'center', fontFamily: 'Cairo,sans-serif', marginBottom: 8 }}>
              {lang === 'ar' ? wp.titleAr : wp.titleEn}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'Cairo,sans-serif', lineHeight: 1.6 }}>
              {lang === 'ar' ? wp.bodyAr : wp.bodyEn}
            </div>
            <div style={{ marginTop: 14, padding: '10px 16px', borderRadius: 10, background: 'var(--primary)', color: '#fff', textAlign: 'center', fontSize: 13, fontFamily: 'Cairo,sans-serif', fontWeight: 700 }}>
              {lang === 'ar' ? wp.btnTextAr : wp.btnTextEn}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── JOIN REQUESTS SECTION ───────────────────────────────────
function JoinRequestsSec() {
  const { data, setData, t, lang } = useApp();
  const requests: JoinRequest[] = data.joinRequests || [];

  const updateStatus = (id: string, status: JoinRequest['status']) => {
    setData({ ...data, joinRequests: requests.map((r) => r.id === id ? { ...r, status } : r) });
  };
  const deleteReq = (id: string) => {
    setData({ ...data, joinRequests: requests.filter((r) => r.id !== id) });
  };

  const statusColor: Record<JoinRequest['status'], string> = {
    pending: '#f59e0b', accepted: '#16a34a', rejected: '#dc2626'
  };
  const statusLabel: Record<JoinRequest['status'], string> = {
    pending: lang === 'ar' ? 'معلق' : 'Pending',
    accepted: lang === 'ar' ? 'مقبول' : 'Accepted',
    rejected: lang === 'ar' ? 'مرفوض' : 'Rejected',
  };

  if (requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <p>{t('لا توجد طلبات انضمام بعد', 'No join requests yet')}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {(['pending', 'accepted', 'rejected'] as const).map((s) => (
          <span key={s} style={{ padding: '3px 12px', borderRadius: 100, fontSize: 12, fontFamily: 'Cairo,sans-serif', fontWeight: 700, background: statusColor[s] + '20', color: statusColor[s] }}>
            {statusLabel[s]}: {requests.filter((r) => r.status === s).length}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {requests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((req) => (
          <div key={req.id} style={{ background: 'var(--surface)', borderRadius: 14, padding: '18px 20px', border: `1.5px solid ${statusColor[req.status]}30` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Cairo,sans-serif', color: 'var(--text)' }}>{req.nameAr}</span>
                  {req.nameEn && <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>({req.nameEn})</span>}
                  <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: statusColor[req.status] + '20', color: statusColor[req.status], fontFamily: 'Cairo,sans-serif' }}>
                    {statusLabel[req.status]}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}>📞 {req.phone}</span>
                  <span style={{ fontSize: 13, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}>🎂 {t('العمر:', 'Age:')} {req.age}</span>
                  {req.groupId && <span style={{ fontSize: 13, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}>
                    🏕️ {data.groups.find((g) => g.id === req.groupId)?.[lang === 'ar' ? 'nameAr' : 'nameEn'] || req.groupId}
                  </span>}
                  <span style={{ fontSize: 11, fontFamily: 'Jost,sans-serif', color: 'var(--text-muted)' }}>
                    {new Date(req.date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-GB')}
                  </span>
                </div>
                {req.message && <p style={{ fontSize: 13, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)', marginTop: 8, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>{req.message}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {req.status !== 'accepted' && (
                  <button onClick={() => updateStatus(req.id, 'accepted')} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #86efac', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: '#16a34a', fontWeight: 600 }}>✓ {t('قبول', 'Accept')}</button>
                )}
                {req.status !== 'rejected' && (
                  <button onClick={() => updateStatus(req.id, 'rejected')} style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: '#dc2626', fontWeight: 600 }}>✗ {t('رفض', 'Reject')}</button>
                )}
                <button onClick={() => { if (confirm(t('حذف؟', 'Delete?'))) deleteReq(req.id); }} style={{ padding: '5px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 14 }}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────
const SECTIONS = [
  { id: 'overview', icon: '📊', ar: 'النظرة العامة', en: 'Overview' },
  { id: 'hero', icon: '🖼️', ar: 'صور الغلاف', en: 'Hero Images' },
  { id: 'logo', icon: '🔖', ar: 'الشعار', en: 'Logo' },
  { id: 'about', icon: '📖', ar: 'عن المجموعة', en: 'About' },
  { id: 'groups', icon: '🏕️', ar: 'الفرق', en: 'Troops' },
  { id: 'leaders', icon: '🎖️', ar: 'القادة', en: 'Leaders' },
  { id: 'scouts', icon: '👥', ar: 'الكشافون', en: 'Scouts' },
  { id: 'activities', icon: '⚡', ar: 'الأنشطة', en: 'Activities' },
  { id: 'gallery', icon: '📷', ar: 'المعرض', en: 'Gallery' },
  { id: 'archive', icon: '📦', ar: 'الأرشيف', en: 'Archive' },
  { id: 'news', icon: '📰', ar: 'الأخبار', en: 'News' },
  { id: 'achievements', icon: '🏆', ar: 'الإنجازات', en: 'Achievements' },
  { id: 'calendar', icon: '🗓️', ar: 'الفعاليات', en: 'Calendar' },
  { id: 'homevideos', icon: '🎬', ar: 'فيديوهات الرئيسية', en: 'Home Videos' },
  { id: 'media', icon: '📐', ar: 'إعدادات الوسائط', en: 'Media Sizes' },
  { id: 'scoutofmonth', icon: '⭐', ar: 'كشاف الشهر', en: 'Scout of Month' },
  { id: 'joinrequests', icon: '📋', ar: 'طلبات الانضمام', en: 'Join Requests' },
  { id: 'welcome', icon: '👋', ar: 'رسالة الترحيب', en: 'Welcome Popup' },
  { id: 'colors', icon: '🎨', ar: 'الألوان', en: 'Colors' },
  { id: 'settings', icon: '⚙️', ar: 'الإعدادات', en: 'Settings' },
  { id: 'admins', icon: '🔐', ar: 'المديرون', en: 'Admins' },
];

export default function AdminPage({ setPage }: { setPage: (p: string) => void }) {
  const { data, lang, t, logout, currentUser } = useApp();
  const [section, setSection] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const current = SECTIONS.find((s) => s.id === section);

  const renderSection = () => {
    switch (section) {
      case 'overview': return <OverviewSec setSection={setSection} />;
      case 'hero': return <HeroSec />;
      case 'logo': return <LogoSec />;
      case 'about': return <AboutSec />;
      case 'groups': return <GroupsSec />;
      case 'leaders': return <LeadersSec />;
      case 'scouts': return <Suspense fallback={<div style={{ padding: 24, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}>{t('جاري التحميل...', 'Loading...')}</div>}><ScoutsSection /></Suspense>;
      case 'activities': return <ActivitiesSec />;
      case 'gallery': return <GallerySec />;
      case 'archive': return <ArchiveSec />;
      case 'news': return <NewsSec />;
      case 'achievements': return <AchievementsSec />;
      case 'calendar': return <CalendarSec />;
      case 'homevideos': return <HomeVideosSec />;
      case 'media': return <MediaSec />;
      case 'scoutofmonth': return <ScoutOfMonthSec />;
      case 'joinrequests': return <JoinRequestsSec />;
      case 'welcome': return <WelcomeSec />;
      case 'colors': return <ColorsSec />;
      case 'settings': return <SettingsSec />;
      case 'admins': return <AdminsSec />;
      default: return null;
    }
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          display: mobileSidebarOpen ? 'block' : undefined,
          position: mobileSidebarOpen ? 'fixed' : undefined,
          zIndex: mobileSidebarOpen ? 2000 : undefined,
        }}
      >
        {/* Brand */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'Cairo,sans-serif' }}>
            {t(data.siteName.ar, data.siteName.en)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Jost,sans-serif', marginTop: 2 }}>
            {currentUser?.username}
          </div>
        </div>

        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSection(s.id); setMobileSidebarOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 20px', border: 'none', cursor: 'pointer',
              background: section === s.id ? 'rgba(255,255,255,0.15)' : 'none',
              color: section === s.id ? '#fff' : 'rgba(255,255,255,0.65)',
              fontSize: 13, fontFamily: 'Cairo,sans-serif',
              borderInlineStart: section === s.id ? '3px solid rgba(255,255,255,0.7)' : '3px solid transparent',
              transition: 'all 0.15s',
              textAlign: lang === 'ar' ? 'right' : 'left',
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
            <span>{lang === 'ar' ? s.ar : s.en}</span>
          </button>
        ))}

        {/* Bottom actions */}
        <div style={{ padding: '16px 20px', marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setPage('home')} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif' }}>
            👁️ {t('عرض الموقع', 'View Site')}
          </button>
          <button onClick={() => { logout(); setPage('home'); }} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,100,100,0.3)', background: 'none', color: 'rgba(255,120,120,0.8)', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif' }}>
            🚪 {t('تسجيل الخروج', 'Logout')}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }} onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="block"
            style={{ padding: '6px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, display: 'none' }}
          >
            ☰
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Cairo,sans-serif', margin: 0, flex: 1 }}>
            {current?.icon} {lang === 'ar' ? current?.ar : current?.en}
          </h1>
          <button onClick={() => setPage('home')} style={{ padding: '7px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif', color: 'var(--text-muted)' }}>
            👁️ {t('عرض الموقع', 'View Site')}
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '28px 24px', overflowY: 'auto' }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
