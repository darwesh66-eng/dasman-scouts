"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { t, type Lang } from "@/lib/i18n";

/** Floating WhatsApp button — homepage only, revealed after the visitor
 *  scrolls past most of the hero (engaged visitors, uncovered content). */
export default function ContactFab({ lang, whatsapp }: { lang: Lang; whatsapp: string }) {
  const pathname = usePathname();
  const isHome = pathname === `/${lang}`;
  const [show, setShow] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        setShow(window.scrollY > window.innerHeight * 0.6);
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

  if (!whatsapp || !isHome) return null;
  const href = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`contact-fab ${show ? "show" : ""}`}
      aria-label={t(lang, "contactUs")}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      <span className="cf-ic">
        <Icon id="i-chat" />
      </span>
      <span className="txt">{t(lang, "contactUs")}</span>
    </a>
  );
}
