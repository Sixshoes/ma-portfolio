'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

type HeroLatticeBackgroundProps = {
  isMobile?: boolean;
  prefersReducedMotion?: boolean | null;
};

/** 游標相對於容器的座標；用於與格點幾何中心比對距離（避免每格 getBoundingClientRect） */
function useThrottledContainerMouse(
  containerRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean
) {
  const [mouse, setMouse] = useState({ x: -1e4, y: -1e4 });
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    const p = pendingRef.current;
    if (p) {
      pendingRef.current = null;
      setMouse(p);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      pendingRef.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      };
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, containerRef, flush]);

  return mouse;
}

function LatticeDot({
  col,
  row,
  cols,
  rows,
  mx,
  my,
  w,
  h,
  interactionRadius,
}: {
  col: number;
  row: number;
  cols: number;
  rows: number;
  mx: number;
  my: number;
  w: number;
  h: number;
  interactionRadius: number;
}) {
  if (w <= 0 || h <= 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-1 w-1 rounded-full bg-slate-600/20" />
      </div>
    );
  }

  const nx = (col + 0.5) * (w / cols);
  const ny = (row + 0.5) * (h / rows);
  const dist = Math.hypot(mx - nx, my - ny);
  const isInteracting = dist < interactionRadius;
  const intensity = isInteracting ? Math.max(0, 1 - dist / interactionRadius) : 0;
  const scale = isInteracting ? 1 + intensity * 1.45 : 1;
  const opacity = isInteracting ? 0.28 + intensity * 0.72 : 0.12;
  const bg = isInteracting ? '#c4a77d' : '#475569';
  const glow = isInteracting ? `0 0 ${8 + intensity * 14}px rgba(196,167,125,0.55)` : 'none';

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="h-1.5 w-1.5 rounded-full transition-[transform,opacity,background-color,box-shadow] duration-200 ease-out will-change-transform"
        style={{
          transform: `scale(${scale})`,
          opacity,
          backgroundColor: bg,
          boxShadow: glow,
        }}
      />
    </div>
  );
}

export function HeroLatticeBackground({
  isMobile = false,
  prefersReducedMotion = false,
}: HeroLatticeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const reduced = prefersReducedMotion === true;
  const cols = isMobile ? 16 : 26;
  const rows = isMobile ? 10 : 12;
  const total = rows * cols;
  const interactionRadius = isMobile ? 110 : 150;

  const trackMouse = !reduced;
  const mouse = useThrottledContainerMouse(containerRef, trackMouse);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      setDims({ w: el.clientWidth, h: el.clientHeight });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-transparent"
      aria-hidden
    >
      <div
        className="absolute inset-0 grid h-full w-full opacity-[0.55]"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          return (
            <LatticeDot
              key={i}
              col={col}
              row={row}
              cols={cols}
              rows={rows}
              mx={reduced ? -1e4 : mouse.x}
              my={reduced ? -1e4 : mouse.y}
              w={dims.w}
              h={dims.h}
              interactionRadius={interactionRadius}
            />
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,10,9,0.38)_55%,#0c0a09_92%)]" />
    </div>
  );
}
