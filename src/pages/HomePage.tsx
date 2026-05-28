import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useCountUp } from '@/hooks/useCountUp';
import { useTilt } from '@/hooks/useTilt';
import { useMagnetic } from '@/hooks/useMagnetic';
import GradientMesh from '@/components/GradientMesh';
import WaveDivider from '@/components/WaveDivider';
import NewsSlider from '@/components/NewsSlider';
import { getVideoUrl } from '@/lib/videoStore';

// ─── RevealHeading ───────────────────────────────────────────
function RevealHeading({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          className="word-reveal-word"
          style={{ animationDelay: `${i * 0.08}s`, marginInlineEnd: '0.3em' }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

// ─── TiltCard wrapper ────────────────────────────────────────
function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const tilt = useTilt(9);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={`card ${className ?? ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

// ─── Stat Item ────────────────────────────────────────────────
function StatItem({ target, label, isText }: { target: number; label: string; isText?: boolean }) {
  const { count, ref } = useCountUp(target, 1600);
  return (
    <div style={{ textAlign: 'center', flex: 1, padding: '0 16px' }}>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, color: '#fff', fontFamily: 'Playfair Display,serif' }}
      >
        {isText ? '∞' : count}
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6, fontFamily: 'Cairo,sans-serif' }}>
        {label}
      </div>
    </div>
  );
}

// ─── ActivityVideo component ─────────────────────────────────
function ActivityVideo({ id, url, thumb, caption }: { id: string; url: string; thumb: string; caption: string }) {
  const [src, setSrc] = useState(url);
  const [playing, setPlaying] = useState(false);
  const vidRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!url) {
      getVideoUrl(id).then((u) => { if (u) setSrc(u); });
    }
  }, [id, url]);

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000', cursor: 'pointer' }} onClick={() => setPlaying(true)}>
      {playing && src ? (
        <video ref={vidRef} src={src} controls autoPlay style={{ width: '100%', display: 'block' }} />
      ) : (
        <>
          {thumb ? (
            <img src={thumb} alt={caption} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ aspectRatio: '16/9', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
          )}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>▶</div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── HOME VIDEO CARD ─────────────────────────────────────────
function VideoCard({ video }: { video: import('@/contexts/AppContext').HomeVideo }) {
  const { lang } = useApp();
  const [src, setSrc] = useState(video.url);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!video.url && video.type === 'upload') {
      getVideoUrl(video.id).then((u) => { if (u) setSrc(u); });
    }
  }, [video]);

  const getYtId = (url: string) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/)?.[1];
  const ytId = video.type === 'youtube' ? getYtId(src) : null;

  return (
    <div style={{ minWidth: 280, maxWidth: 320, flexShrink: 0, scrollSnapAlign: 'start' }}>
      <TiltCard style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0a0a1a', cursor: 'pointer' }} onClick={() => setPlaying(true)}>
          {playing ? (
            video.type === 'youtube' && ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : src ? (
              <video src={src} controls autoPlay style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null
          ) : (
            <>
              {video.type === 'youtube' && ytId ? (
                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, background: 'linear-gradient(135deg,#1a1a3e,#0a0a1a)' }}>🎬</div>
              )}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>▶</div>
              </div>
            </>
          )}
        </div>
        {(video.titleAr || video.titleEn) && (
          <div style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, fontFamily: 'Cairo,sans-serif', color: 'var(--text)' }}>
            {lang === 'ar' ? video.titleAr : video.titleEn}
          </div>
        )}
      </TiltCard>
    </div>
  );
}

// ─── ACTIVITIES SECTION ──────────────────────────────────────
function ActivitiesSection({ setPage }: { setPage: (p: string) => void }) {
  const { data, lang, t } = useApp();
  const [lightbox, setLightbox] = useState<{ media: import('@/contexts/AppContext').ActivityMedia; index: number } | null>(null);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  const activities = data.activities.slice(0, 6);

  return (
    <section style={{ padding: '80px 0', background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div className="sa" style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="label" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: 12, display: 'inline-block' }}>
            {t('أنشطتنا', 'Our Activities')}
          </span>
          <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, color: 'var(--text)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
            {t('أبرز الأنشطة والفعاليات', 'Highlights & Activities')}
          </h2>
        </div>

        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontFamily: 'Cairo,sans-serif' }}>
            {t('لا توجد أنشطة بعد', 'No activities yet')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
            {activities.map((act, i) => (
              <TiltCard key={act.id} className={`sa delay-${Math.min(i + 1, 5)}`} style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ height: 'var(--card-img-h)', overflow: 'hidden', background: 'var(--surface-2)', position: 'relative' }}>
                  {act.photo ? (
                    <img src={act.photo} alt={act.nameAr} style={{ width: '100%', height: '100%', objectFit: 'var(--img-fit)' as 'cover' }} loading="lazy" />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, background: 'var(--primary-light)' }}>⚡</div>
                  )}
                  {act.media.length > 0 && (
                    <div style={{ position: 'absolute', bottom: 10, insetInlineEnd: 10 }}>
                      <span className="label glass" style={{ color: '#fff', fontSize: 11 }}>
                        {act.media.length} {t('وسائط', 'media')}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'Jost,sans-serif' }}>
                    {act.date && new Date(act.date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 8 }}>
                    {lang === 'ar' ? act.nameAr : act.nameEn}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, fontFamily: 'Cairo,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {lang === 'ar' ? act.descriptionAr : act.descriptionEn}
                  </p>
                  {act.media.length > 0 && (
                    <button
                      style={{ marginTop: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', color: 'var(--primary)', fontWeight: 600 }}
                      onClick={() => setActiveActivity(activeActivity === act.id ? null : act.id)}
                    >
                      {activeActivity === act.id ? t('إخفاء الوسائط', 'Hide Media') : t('عرض الوسائط', 'View Media')}
                    </button>
                  )}
                </div>
                {activeActivity === act.id && act.media.length > 0 && (
                  <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {act.media.map((m, mi) => (
                      <div key={m.id} style={{ borderRadius: 8, overflow: 'hidden', cursor: 'pointer', aspectRatio: '1', background: '#000' }} onClick={() => setLightbox({ media: m, index: mi })}>
                        {m.type === 'image' ? (
                          <img src={m.thumb || m.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', fontSize: 24 }}>🎬</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TiltCard>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
            {lightbox.media.type === 'image' ? (
              <img src={lightbox.media.url} alt={lightbox.media.caption} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 16 }} />
            ) : (
              <ActivityVideo id={lightbox.media.id} url={lightbox.media.url} thumb={lightbox.media.thumb} caption={lightbox.media.caption} />
            )}
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: -16, insetInlineEnd: -16, width: 36, height: 36, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── MAIN HOMEPAGE ────────────────────────────────────────────
export default function HomePage({ setPage }: { setPage: (p: string) => void }) {
  const { data, lang, t } = useApp();
  useScrollReveal();

  // Hero state
  const [slideIndex, setSlideIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const heroImages = data.heroImages.length > 0 ? data.heroImages : [''];

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const t = setInterval(() => setSlideIndex((p) => (p + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  const magCta1 = useMagnetic(0.3);
  const magCta2 = useMagnetic(0.3);
  const magCtaFinal1 = useMagnetic(0.3);
  const magCtaFinal2 = useMagnetic(0.3);

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = data.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const publishedNews = data.news.filter((n) => n.published).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ─────────────────────────────────────────
          1. HERO
      ───────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 'var(--hero-h)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Layer 1: BG image parallax */}
        {heroImages.map((img, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: img ? `url(${img})` : 'linear-gradient(135deg,#0b1632 0%,#1b3a6b 100%)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              transform: `translateY(${scrollY * 0.38}px)`,
              opacity: i === slideIndex ? 1 : 0,
              transition: 'opacity 0.8s ease',
              willChange: 'transform',
            }}
          />
        ))}
        {/* Layer 2: Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: `rgba(11,22,50,var(--hero-overlay))` }} />
        {/* Layer 3: Diagonal stripes */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.018) 14px,rgba(255,255,255,0.018) 28px)',
          transform: `translateY(${scrollY * 0.15}px)`,
        }} />
        {/* Layer 4: Kuwait badge counter-parallax */}
        <div
          className="glass-dark"
          style={{
            position: 'absolute', top: 96, insetInlineEnd: 32,
            padding: '8px 16px', borderRadius: 100,
            fontSize: 14, color: '#fff', fontFamily: 'Jost,sans-serif',
            transform: `translateY(${-scrollY * 0.1}px)`,
          }}
        >
          KUWAIT 🇰🇼
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px', maxWidth: 800, margin: '0 auto' }}>
          {/* Animated logo */}
          <div className="float-badge" style={{ marginBottom: 28 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto', position: 'relative' }}>
              {[0, 1].map((i) => (
                <div key={i} style={{
                  position: 'absolute', inset: i * -18,
                  borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)',
                }} />
              ))}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: '#fff' }}>
                {data.logoSettings.url ? (
                  <img src={data.logoSettings.url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, color: 'var(--primary)' }}>⚜️</div>
                )}
              </div>
            </div>
          </div>

          {/* Pill subtitle */}
          <div className="glass" style={{ display: 'inline-block', padding: '5px 20px', borderRadius: 100, color: 'rgba(255,255,255,0.9)', fontSize: 13, marginBottom: 16, fontFamily: 'Jost,sans-serif', letterSpacing: '0.05em' }}>
            {data.siteName.subtitle}
          </div>

          {/* Word-reveal heading */}
          <RevealHeading
            text={lang === 'ar' ? data.siteName.ar : data.siteName.en}
            style={{
              fontSize: 'clamp(28px,6vw,64px)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.1,
              fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif',
            }}
          />
          <p style={{ fontSize: 'clamp(14px,2vw,18px)', color: 'rgba(255,255,255,0.8)', marginBottom: 36, fontFamily: 'Cairo,sans-serif', lineHeight: 1.7 }}>
            {t('بناء قيادات المستقبل عبر قيم الكشافة الأصيلة', 'Building future leaders through authentic scouting values')}
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              ref={magCta1.ref}
              onMouseMove={magCta1.onMouseMove}
              onMouseLeave={magCta1.onMouseLeave}
              onClick={() => setPage('about')}
              style={{
                padding: '13px 32px', borderRadius: 12, border: 'none',
                background: 'var(--primary)', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
                boxShadow: '0 8px 32px rgba(27,58,107,0.4)',
              }}
            >
              {t('اعرف أكثر', 'Learn More')}
            </button>
            <button
              ref={magCta2.ref}
              onMouseMove={magCta2.onMouseMove}
              onMouseLeave={magCta2.onMouseLeave}
              onClick={() => setPage('calendar')}
              style={{
                padding: '13px 32px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.5)',
                background: 'transparent', color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif',
              }}
            >
              {t('الفعاليات', 'Events')}
            </button>
          </div>
        </div>

        {/* Slide dots */}
        {heroImages.length > 1 && (
          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                style={{
                  width: i === slideIndex ? 24 : 8, height: 8, borderRadius: 100,
                  border: 'none', background: i === slideIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', transition: 'all 0.3s', padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, insetInlineEnd: 32, color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.12em', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontFamily: 'Jost,sans-serif' }}>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.3)' }} />
          SCROLL
        </div>
      </section>

      {/* Wave: hero → stats */}
      <WaveDivider color="var(--primary)" />

      {/* ─────────────────────────────────────────
          2. STATS BAR
      ───────────────────────────────────────── */}
      <section style={{ background: 'var(--primary)', padding: '16px 24px 40px', overflow: 'hidden', position: 'relative' }}>
        <GradientMesh colors={['rgba(91,164,207,0.2)', 'rgba(255,255,255,0.05)', 'rgba(91,164,207,0.15)', 'rgba(255,255,255,0.03)']} />
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 1 }}>
          <StatItem target={data.scouts.filter((s) => s.visible).length} label={t('كشاف نشط', 'Active Scouts')} />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <StatItem target={data.leaders.length} label={t('قائد ومعلم', 'Leaders & Teachers')} />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <StatItem target={data.groups.length} label={t('فرق كشفية', 'Scout Troops')} />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)' }} />
          <StatItem target={0} label={t('أنشطة كشفية وترفيهية متنوعة', 'Diverse Scout & Fun Activities')} isText />
        </div>
      </section>

      {/* Wave: stats → about */}
      <WaveDivider color="var(--bg)" flip />

      {/* ─────────────────────────────────────────
          3. ABOUT SNIPPET
      ───────────────────────────────────────── */}
      <section style={{ padding: '88px 24px', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 48, alignItems: 'center' }}>
        {/* Left: text */}
        <div>
          <span className="label sa" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: 16, display: 'inline-block' }}>
            {t('من نحن', 'Who We Are')}
          </span>
          <h2 className="sa delay-1" style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: 'var(--text)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif', marginBottom: 16, lineHeight: 1.2 }}>
            {t('عن مجموعة دسمان الكشفية', 'About Dasman Scout Group')}
          </h2>
          <p className="sa delay-2" style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.9, fontFamily: 'Cairo,sans-serif', marginBottom: 28 }}>
            {lang === 'ar' ? data.about.ar.history.slice(0, 220) + '...' : data.about.en.history.slice(0, 220) + '...'}
          </p>
          <button
            className="sa delay-3"
            onClick={() => setPage('about')}
            style={{
              padding: '11px 28px', borderRadius: 12, border: '2px solid var(--primary)',
              background: 'none', color: 'var(--primary)', fontFamily: 'Cairo,sans-serif',
              fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            {t('اقرأ المزيد', 'Read More')}
          </button>
        </div>
        {/* Right: glass cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: '🕰️', title: t('رسالتنا', 'Mission'), body: lang === 'ar' ? data.about.ar.mission : data.about.en.mission },
            { icon: '🌟', title: t('رؤيتنا', 'Vision'), body: lang === 'ar' ? data.about.ar.vision : data.about.en.vision },
          ].map((card, i) => (
            <TiltCard key={i} className={`sa-right delay-${i + 1}`} style={{ padding: 24, background: i === 0 ? 'var(--primary)' : 'var(--surface)', borderRadius: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Cairo,sans-serif', color: i === 0 ? '#fff' : 'var(--text)', marginBottom: 6 }}>{card.title}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.75, fontFamily: 'Cairo,sans-serif', color: i === 0 ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.body}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Wave: about → troops */}
      <WaveDivider color="var(--surface-2)" />

      {/* ─────────────────────────────────────────
          4. TROOPS
      ───────────────────────────────────────── */}
      <section style={{ background: 'var(--surface-2)', padding: '16px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="sa" style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="label" style={{ background: 'var(--primary-light)', color: 'var(--primary)', marginBottom: 12, display: 'inline-block' }}>
              {t('الفرق', 'Troops')}
            </span>
            <h2 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: 'var(--text)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
              {t('فرقنا الكشفية', 'Our Scout Troops')}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 20 }}>
            {data.groups.map((g, i) => (
              <TiltCard
                key={g.id}
                className={`sa-scale delay-${i + 1}`}
                style={{ padding: 32, borderTop: `5px solid ${g.color}`, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              >
                {/* Ghost emoji background */}
                <div style={{ position: 'absolute', insetInlineEnd: -10, bottom: -10, fontSize: 100, opacity: 0.06, userSelect: 'none', pointerEvents: 'none' }}>
                  {g.emoji}
                </div>
                <div style={{ fontSize: 44, marginBottom: 14 }}>{g.emoji}</div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', fontFamily: 'Cairo,sans-serif', marginBottom: 8 }}>
                  {lang === 'ar' ? g.nameAr : g.nameEn}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, fontFamily: 'Cairo,sans-serif', marginBottom: 16 }}>
                  {lang === 'ar' ? g.descriptionAr : g.descriptionEn}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.color }} />
                  <span style={{ fontSize: 12, color: g.color, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
                    {data.scouts.filter((s) => s.groupId === g.id && s.visible).length} {t('كشاف', 'scouts')}
                  </span>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          5. NEWS SLIDER (if published)
      ───────────────────────────────────────── */}
      {publishedNews.length > 0 && (
        <section style={{ padding: '72px 0 0', position: 'relative' }}>
          <NewsSlider setPage={setPage} />
        </section>
      )}

      {/* ─────────────────────────────────────────
          6. ACHIEVEMENTS (if any)
      ───────────────────────────────────────── */}
      {data.achievements.length > 0 && (
        <section style={{ background: 'var(--surface-2)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="sa" style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: 'var(--text)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
                {t('إنجازاتنا', 'Our Achievements')}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 18 }}>
              {data.achievements.slice(0, 4).map((a, i) => (
                <TiltCard key={a.id} className={`sa-scale delay-${i + 1}`} style={{ padding: 24, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{a.icon || '🏆'}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Cairo,sans-serif', marginBottom: 6 }}>
                    {lang === 'ar' ? a.titleAr : a.titleEn}
                  </div>
                  {a.year && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>{a.year}</div>}
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────
          7. UPCOMING EVENTS (if any)
      ───────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="sa" style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: 'var(--text)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
                {t('الفعاليات القادمة', 'Upcoming Events')}
              </h2>
            </div>
            {upcomingEvents.map((ev, i) => {
              const group = data.groups.find((g) => g.id === ev.groupId);
              return (
                <div key={ev.id} className="card sa" style={{ marginBottom: 16, padding: '18px 24px', display: 'flex', gap: 20, alignItems: 'center', borderInlineStart: `4px solid ${group?.color ?? 'var(--secondary)'}` }}>
                  <div style={{ minWidth: 56, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: group?.color ?? 'var(--primary)', fontFamily: 'Playfair Display,serif' }}>
                      {new Date(ev.date).getDate()}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Jost,sans-serif' }}>
                      {new Date(ev.date).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
                      {lang === 'ar' ? ev.titleAr : ev.titleEn}
                    </div>
                    {ev.time && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>⏰ {ev.time}</div>}
                  </div>
                  {group && (
                    <span style={{ padding: '2px 10px', borderRadius: 100, background: group.color + '22', color: group.color, fontSize: 12, fontWeight: 700, fontFamily: 'Cairo,sans-serif' }}>
                      {group.emoji} {lang === 'ar' ? group.nameAr : group.nameEn}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────
          8. SCOUTS OF MONTH
      ───────────────────────────────────────── */}
      {data.scoutsOfMonth.length > 0 && (
        <section style={{ background: 'var(--surface-2)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="sa" style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, color: 'var(--text)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
                {t('كشاف الشهر', 'Scout of the Month')}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24 }}>
              {data.scoutsOfMonth.map((som, i) => {
                const scout = data.scouts.find((s) => s.id === som.scoutId);
                const group = data.groups.find((g) => g.id === som.groupId);
                if (!scout) return null;
                return (
                  <TiltCard key={som.groupId} className={`sa-scale delay-${i + 1}`} style={{ padding: 24, textAlign: 'center', borderTop: `4px solid ${group?.color ?? 'var(--primary)'}` }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 12px', border: `3px solid ${group?.color ?? 'var(--primary)'}`, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {scout.photo ? <img src={scout.photo} alt={scout.nameAr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <span style={{ fontSize: 28 }}>👤</span>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Cairo,sans-serif' }}>{lang === 'ar' ? scout.nameAr : scout.nameEn}</div>
                    {group && <div style={{ fontSize: 12, color: group.color, marginTop: 4, fontFamily: 'Cairo,sans-serif', fontWeight: 600 }}>{group.emoji} {lang === 'ar' ? group.nameAr : group.nameEn}</div>}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'Jost,sans-serif' }}>{lang === 'ar' ? som.month : som.monthEn}</div>
                    {(som.reasonAr || som.reasonEn) && (
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6, fontFamily: 'Cairo,sans-serif' }}>
                        {lang === 'ar' ? som.reasonAr : som.reasonEn}
                      </p>
                    )}
                  </TiltCard>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────
          9. ACTIVITIES
      ───────────────────────────────────────── */}
      <ActivitiesSection setPage={setPage} />

      {/* ─────────────────────────────────────────
          10. HOME VIDEOS
      ───────────────────────────────────────── */}
      {data.homeVideos.length > 0 && (
        <section style={{ padding: '80px 0 80px', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
            <div className="sa" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, color: 'var(--text)', fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}>
                {t('مقاطع مميزة', 'Featured Videos')}
              </h2>
            </div>
          </div>
          <div style={{ overflowX: 'auto', scrollSnapType: 'x mandatory', display: 'flex', gap: 20, padding: '0 24px', scrollbarWidth: 'none' }}>
            {data.homeVideos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </section>
      )}

      {/* Wave: into CTA */}
      <WaveDivider color="var(--primary)" />

      {/* ─────────────────────────────────────────
          11. CTA
      ───────────────────────────────────────── */}
      <section style={{ background: 'var(--primary)', color: '#fff', padding: '48px 24px 96px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <GradientMesh colors={['rgba(91,164,207,0.25)', 'rgba(255,255,255,0.04)', 'rgba(91,164,207,0.18)', 'rgba(255,255,255,0.03)']} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 280, opacity: 0.025, userSelect: 'none', pointerEvents: 'none' }}>
          ⚜️
        </div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <span className="label sa" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', marginBottom: 16, display: 'inline-block' }}>
            {t('انضم إلينا', 'Join Us')}
          </span>
          <RevealHeading
            text={t('كن جزءاً من عائلتنا الكشفية', 'Be Part of Our Scout Family')}
            style={{ fontSize: 'clamp(24px,4vw,44px)', fontWeight: 900, marginBottom: 16, lineHeight: 1.2, fontFamily: lang === 'ar' ? 'Cairo,sans-serif' : 'Playfair Display,serif' }}
          />
          <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 40, fontFamily: 'Cairo,sans-serif', lineHeight: 1.8 }}>
            {t('انضم إلى مجموعة دسمان الكشفية وابدأ رحلتك نحو بناء مهاراتك وقيادة المستقبل', 'Join Dasman Scout Group and start your journey toward building skills and leading the future')}
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              ref={magCtaFinal1.ref}
              onMouseMove={magCtaFinal1.onMouseMove}
              onMouseLeave={magCtaFinal1.onMouseLeave}
              onClick={() => setPage('groups')}
              style={{ padding: '14px 36px', borderRadius: 14, border: 'none', background: '#fff', color: 'var(--primary)', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'Cairo,sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            >
              {t('الفرق الكشفية', 'Our Groups')}
            </button>
            <button
              ref={magCtaFinal2.ref}
              onMouseMove={magCtaFinal2.onMouseMove}
              onMouseLeave={magCtaFinal2.onMouseLeave}
              onClick={() => setPage('join')}
              style={{ padding: '14px 36px', borderRadius: 14, border: '2px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}
            >
              {t('انضم إلينا', 'Join Us')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
