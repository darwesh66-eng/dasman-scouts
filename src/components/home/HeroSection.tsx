"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import CountUp from "@/components/CountUp";
import { t, type Lang } from "@/lib/i18n";

interface Stat {
  icon: string;
  ember?: boolean;
  value: number;
  suffix?: string;
  label: string;
}

export default function HeroSection({
  lang,
  heroImage,
  stats,
}: {
  lang: Lang;
  heroImage: string;
  stats: Stat[];
}) {
  const bgRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const frame = () => {
      raf.current = null;
      const y = scrollY;
      const vh = innerHeight;
      if (bgRef.current)
        bgRef.current.style.transform = `translateY(${y * 0.28}px) scale(${1 + Math.min(y / vh, 1) * 0.06})`;
      railRef.current
        ?.querySelectorAll<HTMLElement>(".srail-card")
        .forEach((c) => (c.style.transform = `translateY(${-y * +(c.dataset.f ?? 0)}px)`));
    };
    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(frame);
    };
    addEventListener("scroll", onScroll, { passive: true });
    frame();
    return () => {
      removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg" ref={bgRef}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImage} alt={t(lang, "brand")} fetchPriority="high" />
      </div>
      <div className="hero-scrim" />
      <div className="hero-content wrap">
        <div className="hero-grid">
          <div>
            <span className="kicker">
              <Icon id="i-fleur" /> {t(lang, "kicker")}
            </span>
            <h1>
              {t(lang, "heroTitle1")}
              <br />
              {t(lang, "heroTitle2")} <em>{t(lang, "heroTitleEm")}</em>
            </h1>
            <p className="tag">{t(lang, "heroTag")}</p>
            <div className="btns">
              <Link href={`/${lang}/join`} className="btn btn-e">
                {t(lang, "ctaStart")}{" "}
                <span className="ico">
                  <Icon id="i-arrow" />
                </span>
              </Link>
              <a href="#trail" className="btn btn-ghost">
                {t(lang, "ctaTroops")}
              </a>
            </div>
          </div>
          <div className="stat-rail" ref={railRef}>
            {stats.map((s, i) => (
              <div key={s.label} className="srail-card" data-f={0.12 + i * 0.09}>
                <span className={`badge ${s.ember ? "ember" : ""}`}>
                  <Icon id={s.icon} />
                </span>
                <div>
                  <div className="n num">
                    <CountUp target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="l">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
