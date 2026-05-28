import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { Scout } from '@/contexts/AppContext';
import MembershipCard from '@/components/MembershipCard';
import { compressImage } from '@/lib/compress';

const PAGE_SIZE = 20;

function ScoutRow({ scout, onEdit, onToggle, onDelete, onCard }: {
  scout: Scout;
  onEdit: (s: Scout) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onCard: (s: Scout) => void;
}) {
  const { data, lang, t } = useApp();
  const group = data.groups.find((g) => g.id === scout.groupId);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: scout.visible ? 'var(--surface)' : 'var(--surface-2)', marginBottom: 8 }}>
      {/* Photo */}
      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${group?.color ?? 'var(--border)'}`, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {scout.photo ? (
          <img src={scout.photo} alt={scout.nameAr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" />
        ) : <span style={{ fontSize: 20 }}>👤</span>}
      </div>
      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {lang === 'ar' ? scout.nameAr : scout.nameEn}
        </div>
        <div style={{ fontSize: 11, color: group?.color ?? 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>
          {group ? `${group.emoji} ${lang === 'ar' ? group.nameAr : group.nameEn}` : t('بدون فرقة', 'No group')}
          {data.scoutFieldsConfig.grade && scout.grade ? ` — ${scout.grade}` : ''}
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => onCard(scout)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13 }} title="Membership Card">🪪</button>
        <button onClick={() => onToggle(scout.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13 }} title={scout.visible ? t('إخفاء', 'Hide') : t('إظهار', 'Show')}>{scout.visible ? '👁️' : '🙈'}</button>
        <button onClick={() => onEdit(scout)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{t('تعديل', 'Edit')}</button>
        <button onClick={() => { if (confirm(t('حذف هذا الكشاف؟', 'Delete this scout?'))) onDelete(scout.id); }} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{t('حذف', 'Delete')}</button>
      </div>
    </div>
  );
}

interface FormState { id?: string; nameAr: string; nameEn: string; photo: string; groupId: string; visible: boolean; grade: string; }

export default function ScoutsSection() {
  const { data, setData, lang, t } = useApp();
  const [filterGroup, setFilterGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [cardScout, setCardScout] = useState<Scout | null>(null);
  const [uploading, setUploading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.scouts.filter((s) => {
      if (filterGroup !== 'all' && s.groupId !== filterGroup) return false;
      if (q && !s.nameAr.includes(q) && !s.nameEn.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data.scouts, filterGroup, search]);

  const paginated = useMemo(() => filtered.slice(0, (page + 1) * PAGE_SIZE), [filtered, page]);

  const save = useCallback((form: FormState) => {
    const newScout: Scout = {
      id: form.id ?? `s_${Date.now()}`,
      nameAr: form.nameAr,
      nameEn: form.nameEn,
      photo: form.photo,
      groupId: form.groupId,
      visible: form.visible,
      grade: form.grade || undefined,
    };
    const scouts = form.id
      ? data.scouts.map((s) => (s.id === form.id ? newScout : s))
      : [...data.scouts, newScout];
    setData({ ...data, scouts });
    setEditing(null);
  }, [data, setData]);

  const toggle = useCallback((id: string) => {
    setData({ ...data, scouts: data.scouts.map((s) => s.id === id ? { ...s, visible: !s.visible } : s) });
  }, [data, setData]);

  const del = useCallback((id: string) => {
    setData({ ...data, scouts: data.scouts.filter((s) => s.id !== id) });
  }, [data, setData]);

  const exportCsv = () => {
    const rows = [
      ['Name AR', 'Name EN', 'Group', 'Grade', 'Visible'],
      ...data.scouts.map((s) => {
        const g = data.groups.find((g) => g.id === s.groupId);
        return [s.nameAr, s.nameEn, g?.nameEn ?? '', s.grade ?? '', s.visible ? 'Yes' : 'No'];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'scouts.csv';
    a.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const url = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.82 });
      setEditing({ ...editing, photo: url });
    } catch { }
    setUploading(false);
  };

  const blank: FormState = { nameAr: '', nameEn: '', photo: '', groupId: data.groups[0]?.id ?? '', visible: true, grade: '' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Cairo,sans-serif', margin: 0 }}>
          👥 {t('الكشافون', 'Scouts')} ({data.scouts.length})
        </h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportCsv} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif' }}>
            {t('تصدير CSV', 'Export CSV')}
          </button>
          <button onClick={() => setEditing(blank)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
            + {t('إضافة كشاف', 'Add Scout')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder={t('بحث...', 'Search...')}
          style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif', flex: 1, minWidth: 150 }}
        />
        <select
          value={filterGroup}
          onChange={(e) => { setFilterGroup(e.target.value); setPage(0); }}
          style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif', cursor: 'pointer' }}
        >
          <option value="all">{t('كل الفرق', 'All Groups')}</option>
          {data.groups.map((g) => (
            <option key={g.id} value={g.id}>{lang === 'ar' ? g.nameAr : g.nameEn}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'Cairo,sans-serif' }}>
        {t('عرض', 'Showing')} {paginated.length} / {filtered.length} {t('كشاف', 'scouts')}
      </div>

      {/* List */}
      {paginated.map((s) => (
        <ScoutRow key={s.id} scout={s} onEdit={(s) => setEditing({ ...s, grade: s.grade ?? '' })} onToggle={toggle} onDelete={del} onCard={setCardScout} />
      ))}

      {/* Load more */}
      {paginated.length < filtered.length && (
        <button
          onClick={() => setPage((p) => p + 1)}
          style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif', marginTop: 8 }}
        >
          {t('تحميل المزيد', 'Load More')} ({filtered.length - paginated.length} {t('متبقي', 'remaining')})
        </button>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditing(null)}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 24, color: 'var(--primary)' }}>
              {editing.id ? t('تعديل الكشاف', 'Edit Scout') : t('إضافة كشاف جديد', 'Add New Scout')}
            </h3>

            {/* Photo */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', border: '2px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {editing.photo ? <img src={editing.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>👤</span>}
              </div>
              <label style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo,sans-serif' }}>
                {uploading ? t('جاري...', 'Uploading...') : t('رفع صورة', 'Upload Photo')}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: t('الاسم بالعربي', 'Name (Arabic)'), key: 'nameAr' as const },
                { label: t('الاسم بالإنجليزي', 'Name (English)'), key: 'nameEn' as const },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: 'Cairo,sans-serif' }}>{f.label}</label>
                  <input
                    value={editing[f.key]}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}
                  />
                </div>
              ))}

              {/* Group select */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: 'Cairo,sans-serif' }}>{t('الفرقة', 'Group')}</label>
                <select value={editing.groupId} onChange={(e) => setEditing({ ...editing, groupId: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
                  {data.groups.map((g) => <option key={g.id} value={g.id}>{lang === 'ar' ? g.nameAr : g.nameEn}</option>)}
                </select>
              </div>

              {/* Grade if enabled */}
              {data.scoutFieldsConfig.grade && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, fontFamily: 'Cairo,sans-serif' }}>{t('الصف', 'Grade')}</label>
                  <input value={editing.grade} onChange={(e) => setEditing({ ...editing, grade: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'Cairo,sans-serif' }} />
                </div>
              )}

              {/* Visible toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: 14 }}>
                <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} />
                {t('ظاهر للعامة', 'Visible to public')}
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => save(editing)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
                {t('حفظ', 'Save')}
              </button>
              <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 15, fontFamily: 'Cairo,sans-serif' }}>
                {t('إلغاء', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Membership card modal */}
      {cardScout && <MembershipCard scout={cardScout} onClose={() => setCardScout(null)} />}
    </div>
  );
}
