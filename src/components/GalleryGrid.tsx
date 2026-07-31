"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import type { GalleryItem } from "@/lib/appData";
import { pick, t, type Lang } from "@/lib/i18n";

const SPANS = ["g1", "g2", "g3", "g4", "g5", "g6"];

/** Editorial photo grid with subtle scroll drift, glass captions and a lightbox. */
export default function GalleryGrid({ lang, items }: { lang: Lang; items: GalleryItem[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const photos = items.filter((it) => it.url);
  const open = index !== null;

  const close = useCallback(() => {
    setIndex(null);
    openerRef.current?.focus();
  }, []);
  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  /* scroll drift (desktop depth cue) */
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
  }, [photos.length]);

  /* lightbox: body lock, keyboard controls, initial focus */
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(lang === "ar" ? -1 : 1);
      else if (e.key === "ArrowLeft") step(lang === "ar" ? 1 : -1);
      else if (e.key === "Tab") e.preventDefault(); // only the lightbox is reachable
    };
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [open, close, step, lang]);

  const current = index !== null ? photos[index] : null;
  const currentCaption = current ? pick(lang, current.captionAr, current.captionEn) : "";

  return (
    <>
      <div className="gal-grid" ref={gridRef}>
        {photos.map((item, i) => {
          const caption = pick(lang, item.captionAr, item.captionEn);
          return (
            <button
              type="button"
              key={item.id}
              className={`gitem ${SPANS[i % SPANS.length]}`}
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setIndex(i);
              }}
              aria-label={caption || `${t(lang, "galPageTitle1")} ${i + 1}`}
            >
              <Image
                src={item.url}
                alt=""
                fill
                sizes="(max-width: 860px) 50vw, 33vw"
                className="gitem-img"
                priority={i === 0}
              />
              {caption && (
                <span className="cap">
                  <Icon id="i-camera" /> {caption}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={currentCaption}>
          <button
            type="button"
            className="lb-backdrop"
            onClick={close}
            aria-label={t(lang, "closeLabel")}
            tabIndex={-1}
          />
          <div className="lb-stage">
            <Image
              src={current.url}
              alt={currentCaption}
              width={1600}
              height={1100}
              sizes="90vw"
              className="lb-img"
            />
            {currentCaption && <div className="lb-cap">{currentCaption}</div>}
          </div>
          <button ref={closeRef} type="button" className="lb-btn lb-close" onClick={close} aria-label={t(lang, "closeLabel")}>
            <Icon id="i-close" />
          </button>
          {photos.length > 1 && (
            <>
              <button type="button" className="lb-btn lb-prev" onClick={() => step(-1)} aria-label={t(lang, "prevLabel")}>
                <Icon id="i-arrow" />
              </button>
              <button type="button" className="lb-btn lb-next" onClick={() => step(1)} aria-label={t(lang, "nextLabel")}>
                <Icon id="i-arrow" />
              </button>
              <div className="lb-count num">
                {index! + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
