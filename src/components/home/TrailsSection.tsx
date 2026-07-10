"use client";

import { useEffect, useRef } from "react";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import { type Group, GROUP_AGES } from "@/lib/appData";
import { t, pick, type Lang } from "@/lib/i18n";

const TROOP_ICONS: Record<string, string> = {
  ashbal: "i-paw",
  fatyan: "i-tent",
  zahrat: "i-flower",
  murshidat: "i-compass",
};

const BOY_PATH = "M45 0 C 45 90, 18 130, 18 200 S 72 330, 72 400 S 45 500, 45 560";
const GIRL_PATH = "M45 0 C 45 90, 72 130, 72 200 S 18 330, 18 400 S 45 500, 45 560";

function Track({
  lang,
  title,
  subtitle,
  headIcon,
  ember,
  path,
  groups,
}: {
  lang: Lang;
  title: string;
  subtitle: string;
  headIcon: string;
  ember?: boolean;
  path: string;
  groups: Group[];
}) {
  return (
    <div className="track">
      <Reveal className="track-head">
        <span className={`badge ${ember ? "ember" : ""}`}>
          <Icon id={headIcon} />
        </span>
        <div>
          <div className="th-t">{title}</div>
          <div className="th-s">{subtitle}</div>
        </div>
      </Reveal>
      <svg className="t-svg" viewBox="0 0 90 560" preserveAspectRatio="none">
        <path className="ghost" d={path} />
        <path className="live tpath" d={path} />
      </svg>
      {groups.map((g, i) => (
        <Reveal key={g.id} className="tstop" delay={i as 0 | 1}>
          <span className={`badge ${ember ? "ember" : ""}`}>
            <Icon id={TROOP_ICONS[g.id] ?? "i-fleur"} />
          </span>
          <div className="card">
            {GROUP_AGES[g.id] && <span className="age">{GROUP_AGES[g.id][lang]}</span>}
            <h3>{pick(lang, g.nameAr, g.nameEn)}</h3>
            <p>{pick(lang, g.descriptionAr, g.descriptionEn)}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function TrailsSection({ lang, groups }: { lang: Lang; groups: Group[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  const boys = groups.filter((g) => ["ashbal", "fatyan"].includes(g.id));
  const girls = groups.filter((g) => ["zahrat", "murshidat"].includes(g.id));

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const paths = [...el.querySelectorAll<SVGPathElement>(".tpath")].map((p) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = String(L);
      p.style.strokeDashoffset = String(L);
      return { p, L };
    });
    const frame = () => {
      raf.current = null;
      const r = el.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, (innerHeight * 0.8 - r.top) / (r.height * 0.95)),
      );
      paths.forEach(({ p, L }) => (p.style.strokeDashoffset = String(L * (1 - progress))));
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
  }, [groups.length]);

  if (!boys.length && !girls.length) return null;

  return (
    <section className="trail-sec topo" id="trail">
      <div className="wrap">
        <Reveal as="h2" className="sec-title">
          {t(lang, "trailsTitle")}
        </Reveal>
        <Reveal as="p" className="sec-sub" delay={1}>
          {t(lang, "trailsSub")}
        </Reveal>
        <div className="tracks" ref={wrapRef}>
          {boys.length > 0 && (
            <Track
              lang={lang}
              title={t(lang, "boysSection")}
              subtitle={t(lang, "boysSub")}
              headIcon="i-tent"
              path={BOY_PATH}
              groups={boys}
            />
          )}
          {girls.length > 0 && (
            <Track
              lang={lang}
              title={t(lang, "girlsSection")}
              subtitle={t(lang, "girlsSub")}
              headIcon="i-flower"
              ember
              path={GIRL_PATH}
              groups={girls}
            />
          )}
        </div>
      </div>
    </section>
  );
}
