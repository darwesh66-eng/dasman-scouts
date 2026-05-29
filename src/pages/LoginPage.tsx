import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function LoginPage({ setPage }: { setPage: (p: string) => void }) {
  const { login, t, lang, data } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: loginError } = await login(email.trim(), password);
    setLoading(false);
    if (!loginError) {
      setPage('admin');
    } else {
      // Supabase returns English error messages; translate the common ones
      if (loginError.toLowerCase().includes('invalid') || loginError.toLowerCase().includes('credentials')) {
        setError(t('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'Invalid email or password'));
      } else {
        setError(loginError);
      }
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid var(--border)', fontSize: 15,
    outline: 'none', fontFamily: 'Cairo,sans-serif',
    color: 'var(--text)', background: 'var(--surface-2)',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh', background: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, fontFamily: 'Cairo,sans-serif',
        backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.025) 14px,rgba(255,255,255,0.025) 28px)',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'var(--surface)', borderRadius: 24,
        padding: 40, boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {data.logoSettings.url ? (
            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid var(--primary)' }}>
              <img src={data.logoSettings.url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚜️</div>
          )}
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>
            {t('تسجيل الدخول', 'Admin Login')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {t('لوحة تحكم الإدارة', 'Dashboard access')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>
              {t('البريد الإلكتروني', 'Email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              dir="ltr"
              placeholder="admin@example.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>
              {t('كلمة المرور', 'Password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px', borderRadius: 12, border: 'none',
              background: 'var(--primary)', color: '#fff',
              fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Cairo,sans-serif', opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? t('جاري...', 'Loading...') : t('دخول', 'Sign In')}
          </button>
        </form>

        <button
          onClick={() => setPage('home')}
          style={{
            display: 'block', width: '100%', marginTop: 16, padding: '10px',
            borderRadius: 10, border: '1px solid var(--border)',
            background: 'none', cursor: 'pointer', fontSize: 14,
            color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif',
          }}
        >
          {t('← العودة للرئيسية', '← Back to Home')}
        </button>
      </div>
    </div>
  );
}
