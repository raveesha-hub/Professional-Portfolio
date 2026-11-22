import { useEffect, useRef, useState } from 'react';

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;

    setActive(true);
    let tx = -100;
    let ty = -100;
    let cx = -100;
    let cy = -100;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${tx - 3}px, ${ty - 3}px, 0)`;
      }
    };

    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${cx - 18}px, ${cy - 18}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none" aria-hidden="true">
      <div
        ref={ringRef}
        className="w-9 h-9 rounded-full border border-purple-400/50 shadow-[0_0_22px_rgba(124,58,237,0.35)] transition-opacity duration-200"
      />
      <div
        ref={dotRef}
        className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]"
      />
    </div>
  );
}
