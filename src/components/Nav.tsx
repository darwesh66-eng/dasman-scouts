"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { t, type Lang } from "@/lib/i18n";

export default function Nav({ lang, logoUrl }: { lang: Lang; logoUrl: string }) {
  const pathname = usePathname();
  const isHome = pathname === `/${lang}`;
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const raf = useRef<number | null>(null);
  const lastY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

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
        const y = window.scrollY;
        setScrolled(y > (isHome ? window.innerHeight * 0.75 : 80));
        // auto-hide: slide away while scrolling down, return on scroll up
        const delta = y - lastY.current;
        if (y < 130) setHidden(false);
        else if (delta > 6) setHidden(true);
        else if (delta < -6) setHidden(false);
        lastY.current = y;
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

    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
        return;
      }
      // keep Tab inside the open drawer
      if (e.key !== "Tab") return;
      const items = drawerRef.current?.querySelectorAll<HTMLElement>("a[href]");
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !drawerRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    addEventListener("keydown", onKey);
    // .open flips visibility with no transition, so the first link is
    // focusable in this same commit
    if (open) drawerRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <nav
        className={`nav ${isHome ? (scrolled ? "scrolled" : "") : "solid"} ${open ? "menu-open" : ""} ${hidden && !open ? "hide" : ""}`}
      >
        <div className="nav-inner">
          <Link className="brandline" href={`/${lang}`}>
            <span className="mark">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  width={36}
                  height={36}
                  sizes="36px"
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
          </div>
          <Link href={switchHref} className="lang-switch num" title={otherLang === "ar" ? "العربية" : "English"}>
            {otherLang === "ar" ? "ع" : "EN"}
          </Link>
          <Link href={`/${lang}/join`} className="btn btn-e nav-join">
            {t(lang, "navJoin")}
          </Link>
          <button
            ref={burgerRef}
            type="button"
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
      <div
        ref={drawerRef}
        className={`drawer ${open ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "ar" ? "القائمة" : "Menu"}
        // hidden from AT and taken out of the tab order while closed
        inert={!open}
      >
        <button
          type="button"
          className="drawer-backdrop"
          onClick={() => setOpen(false)}
          aria-label={t(lang, "closeLabel")}
          tabIndex={-1}
        />
        <div className="drawer-inner">
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
        </div>
      </div>
    </>
  );
}
