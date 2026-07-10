"use client";

import { useEffect, useRef } from "react";
import Icon from "@/components/Icon";
import type { GalleryItem } from "@/lib/appData";

const SPANS = ["g1", "g2", "g3", "g4", "g5", "g6"];

/** Editorial photo grid with subtle scroll drift + glass captions. */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cells = [...grid.querySelectorAll<HTMLElement>(".gitem")];
    const frame = () => {
      raf.current = null;
      const vh = innerHeight;
      cells.forEach((g, i) => {
        const r = g.getBoundingClientRect();
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        g.style.transform = `translateY(${c * (i % 2 ? 26 : -18)}px)`;
      });
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
  }, [items.length]);

  return (
    <div className="gal-grid" ref={gridRef}>
      {items.map((item, i) => (
        <div key={item.id} className={`gitem ${SPANS[i % SPANS.length]}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={item.captionAr || ""} loading={i > 2 ? "lazy" : undefined} />
          {item.captionAr && (
            <div className="cap">
              <Icon id="i-camera" /> {item.captionAr}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
