import { useRef, useCallback } from 'react';

export function useMagnetic(strength = 0.35) {
  const ref = useRef<HTMLButtonElement | null>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (window.matchMedia('(hover: none)').matches) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = 'transform 0.15s ease';
    },
    [strength],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.transition = 'transform 0.4s cubic-bezier(0.22,1,0.36,1)';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
