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
  const [open, setOpen] = useState(false);
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

  /* close drawer on route change + lock body scroll while open */
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <nav className={`nav ${isHome ? (scrolled ? "scrolled" : "") : "solid"} ${open ? "menu-open" : ""}`}>
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
            <span className="brand-txt">{t(lang, "brand")}</span>
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
          <Link href={`/${lang}/join`} className="btn btn-e nav-join">
            {t(lang, "navJoin")}
          </Link>
          <button
            className="burger"
            aria-label={lang === "ar" ? "القائمة" : "Menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      <div className={`drawer ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
        <div className="drawer-inner" onClick={(e) => e.stopPropagation()}>
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={`d-link ${pathname === l.href ? "on" : ""}`}
              style={{ transitionDelay: open ? `${0.08 + i * 0.05}s` : "0s" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={`/${lang}/join`}
            className="btn btn-e d-cta"
            style={{ transitionDelay: open ? "0.32s" : "0s" }}
          >
            {t(lang, "navJoin")}
          </Link>
          <Link
            href={switchHref}
            className="d-link d-lang num"
            style={{ transitionDelay: open ? "0.38s" : "0s" }}
          >
            {otherLang === "ar" ? "العربية ع" : "English EN"}
          </Link>
        </div>
      </div>
    </>
  );
}
