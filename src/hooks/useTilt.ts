import { useRef, useCallback } from 'react';

export function useTilt(intensity = 10) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.matchMedia('(hover: none)').matches) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      el.style.transform = `perspective(900px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(8px) scale(1.015)`;
      el.style.boxShadow = `${-x * 8}px ${y * 8}px 32px rgba(27,58,107,0.18)`;
      el.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
    },
    [intensity],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.boxShadow = '';
    el.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
