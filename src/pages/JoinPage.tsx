import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { JoinRequest } from '@/contexts/AppContext';

interface Props { setPage: (p: string) => void }

export default function JoinPage({ setPage }: Props) {
  const { data, setData, lang, t } = useApp();
  const [form, setForm] = useState({ nameAr: '', nameEn: '', phone: '', age: '', groupId: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr.trim() || !form.phone.trim() || !form.age.trim()) {
      setError(t('الرجاء تعبئة الحقول المطلوبة', 'Please fill in required fields'));
      return;
    }
    const req: JoinRequest = {
      id: Date.now().toString(),
      ...form,
      date: new Date().toISOString(),
      status: 'pending',
    };
    setData({ ...data, joinRequests: [...(data.joinRequests || []), req] });
    setSubmitted(true);
    setError('');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid var(--border)', fontSize: 15,
    fontFamily: 'Cairo,sans-serif', color: 'var(--text)',
    background: 'var(--surface-2)', outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div dir={dir} style={{ paddingTop: 'var(--nav-h)' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        padding: '64px 24px 80px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 14px, rgba(255,255,255,0.03) 14px, rgba(255,255,255,0.03) 28px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚜️</div>
          <h1 style={{
            fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, color: '#fff',
            fontFamily: 'Cairo,sans-serif', marginBottom: 12,
          }}>
            {t('انضم إلى عائلة الكشافة', 'Join the Scout Family')}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', fontFamily: 'Cairo,sans-serif', maxWidth: 540, margin: '0 auto' }}>
            {t(
              'سجّل اهتمامك بالانضمام إلى مجموعة دسمان الكشفية وسيتواصل معك فريقنا قريباً',
              'Express your interest in joining Dasman Scout Group and our team will contact you soon'
            )}
          </p>
        </div>
      </div>

      {/* Wave */}
      <div style={{ marginTop: -1, overflow: 'hidden', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 48 }}>
          <path d="M0,24 C360,50 720,-2 1080,24 C1260,36 1380,18 1440,22 L1440,48 L0,48 Z" fill="var(--bg)" />
        </svg>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 24px 80px' }}>
        {submitted ? (
          /* Success state */
          <div style={{
            textAlign: 'center', padding: '60px 32px',
            background: 'var(--surface)', borderRadius: 24,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            animation: 'pageEnter 0.4s cubic-bezier(0.22,1,0.36,1)',
          }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', fontFamily: 'Cairo,sans-serif', marginBottom: 12 }}>
              {t('تم إرسال طلبك بنجاح!', 'Request Submitted!')}
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif', lineHeight: 1.8, marginBottom: 32 }}>
              {t(
                'شكراً لاهتمامك بالانضمام إلى مجموعة دسمان الكشفية. سيتواصل معك أحد القادة قريباً على رقم الهاتف الذي قدمته.',
                'Thank you for your interest in joining Dasman Scout Group. A leader will contact you soon at the phone number you provided.'
              )}
            </p>
            <button
              onClick={() => setPage('home')}
              style={{
                padding: '12px 32px', borderRadius: 14, border: 'none',
                background: 'var(--primary)', color: '#fff',
                fontSize: 15, fontWeight: 800, fontFamily: 'Cairo,sans-serif',
                cursor: 'pointer',
              }}
            >
              {t('العودة للرئيسية', 'Back to Home')}
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} noValidate>
            <div style={{
              background: 'var(--surface)', borderRadius: 24, padding: 'clamp(24px,5vw,40px)',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', fontFamily: 'Cairo,sans-serif', marginBottom: 28 }}>
                {t('استمارة الانضمام', 'Join Application')}
              </h2>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase' }}>
                    {t('الاسم بالعربي *', 'Name (Arabic) *')}
                  </label>
                  <input
                    required
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    placeholder={t('الاسم الكامل', 'Full name')}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase' }}>
                    {t('الاسم بالإنجليزي', 'Name (English)')}
                  </label>
                  <input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="Full name"
                    dir="ltr"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                </div>
              </div>

              {/* Phone & Age */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase' }}>
                    {t('رقم الهاتف *', 'Phone *')}
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+965 XXXX XXXX"
                    dir="ltr"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase' }}>
                    {t('العمر *', 'Age *')}
                  </label>
                  <input
                    required
                    type="number"
                    min="6"
                    max="22"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="8"
                    dir="ltr"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                </div>
              </div>

              {/* Group selection */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase' }}>
                  {t('الفرقة المفضلة', 'Preferred Troop')}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, groupId: '' })}
                    style={{
                      padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: 13,
                      border: `1.5px solid ${!form.groupId ? 'var(--primary)' : 'var(--border)'}`,
                      background: !form.groupId ? 'var(--primary-light)' : 'var(--surface-2)',
                      color: !form.groupId ? 'var(--primary)' : 'var(--text-muted)', transition: 'all 0.2s',
                    }}
                  >
                    {t('لم أقرر بعد', "I'm not sure")}
                  </button>
                  {data.groups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setForm({ ...form, groupId: g.id })}
                      style={{
                        padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontSize: 13,
                        border: `1.5px solid ${form.groupId === g.id ? g.color : 'var(--border)'}`,
                        background: form.groupId === g.id ? g.color + '22' : 'var(--surface-2)',
                        color: form.groupId === g.id ? g.color : 'var(--text-muted)', transition: 'all 0.2s',
                      }}
                    >
                      {g.emoji} {lang === 'ar' ? g.nameAr : g.nameEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'Cairo,sans-serif', textTransform: 'uppercase' }}>
                  {t('ملاحظات إضافية', 'Additional Notes')}
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  placeholder={t('أي معلومات إضافية تريد إضافتها...', 'Any additional information...')}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontSize: 13, fontFamily: 'Cairo,sans-serif', marginBottom: 16, border: '1px solid #fecaca' }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%', padding: '14px 24px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: '#fff', fontSize: 16, fontWeight: 900,
                  fontFamily: 'Cairo,sans-serif', cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(27,58,107,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,107,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,58,107,0.3)'; }}
              >
                ⚜️ {t('أرسل طلب الانضمام', 'Submit Join Request')}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 12, fontFamily: 'Cairo,sans-serif' }}>
                {t('* حقول إلزامية — سيتم التواصل معك في أقرب وقت', '* Required fields — we will contact you soon')}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
