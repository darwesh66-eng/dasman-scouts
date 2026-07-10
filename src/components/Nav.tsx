"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { t, type Lang } from "@/lib/i18n";

export default function Nav({ lang, logoUrl }: { lang: Lang; logoUrl: string }) {
  const pathname = usePathname();
  const isHome = pathname === `/${lang}`;
  const [scrolled, setScrolled] = useState(false);
  const raf = useRef<number | null>(null);

  const links = [
    { href: `/${lang}`, label: t(lang, "navHome") },
    { href: `/${lang}/about`, label: t(lang, "navAbout") },
    { href: `/${lang}/gallery`, label: t(lang, "navGallery") },
    { href: `/${lang}/news`, label: t(lang, "navNews") },
  ];
  const otherLang: Lang = lang === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(`/${lang}`, `/${otherLang}`) || `/${otherLang}`;

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > (isHome ? window.innerHeight * 0.75 : 80));
        raf.current = null;
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [isHome]);

  return (
    <nav className={`nav ${isHome ? (scrolled ? "scrolled" : "") : "solid"}`}>
      <div className="nav-inner">
        <Link className="brandline" href={`/${lang}`}>
          <span className="mark">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <Icon id="i-fleur" />
            )}
          </span>
          {t(lang, "brand")}
        </Link>
        <div className="links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "on" : ""}>
              {l.label}
            </Link>
          ))}
          <Link href={switchHref} className="lang-switch num" title={otherLang === "ar" ? "العربية" : "English"}>
            {otherLang === "ar" ? "ع" : "EN"}
          </Link>
        </div>
        <Link href={`/${lang}/join`} className="btn btn-e">
          {t(lang, "navJoin")}
        </Link>
      </div>
    </nav>
  );
}
