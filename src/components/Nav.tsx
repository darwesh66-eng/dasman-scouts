"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/about", label: "من نحن" },
  { href: "/gallery", label: "المعرض" },
  { href: "/news", label: "الأخبار والفعاليات" },
];

export default function Nav({ logoUrl }: { logoUrl: string }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const raf = useRef<number | null>(null);

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
        <Link className="brandline" href="/">
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
          مجموعة دسمان الكشفية
        </Link>
        <div className="links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "on" : ""}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link href="/join" className="btn btn-e">
          انضم إلينا
        </Link>
      </div>
    </nav>
  );
}
