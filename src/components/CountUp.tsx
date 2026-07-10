"use client";

import { useEffect, useRef } from "react";

export default function CountUp({ target, suffix }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          const t0 = performance.now();
          const dur = 1400;
          const step = (t: number) => {
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = String(target);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  // SSR renders the final value; the count-up is a progressive enhancement,
  // so throttled/paused tabs and no-JS visitors still see the real number.
  return (
    <>
      <span ref={ref} className="num">
        {target}
      </span>
      {suffix ? <em>{suffix}</em> : null}
    </>
  );
}
