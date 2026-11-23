'use client';

import React, { useCallback, useEffect, useRef } from 'react';

type HeroLatticeBackgroundProps = {
  isMobile?: boolean;
  prefersReducedMotion?: boolean | null;
};

/**
 * 細緻建築製圖點陣背景（象牙紙底石墨細點 + 滑鼠滑過泛出古銅金微光），
 * 採可視區監測 + 按需重繪，零背景耗電。
 */
export function HeroLatticeBackground({
  isMobile = false,
  prefersReducedMotion = false,
}: HeroLatticeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1e4, y: -1e4 });
  const sizeRef = useRef({ width: 0, height: 0 });
  const visibleRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const reduced = prefersReducedMotion === true;

  const cols = isMobile ? 16 : 28;
  const rows = isMobile ? 10 : 14;
  const interactionRadius = isMobile ? 110 : 160;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (w <= 0 || h <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, w * dpr, h * dpr);

      const mx = mouseRef.current.x * dpr;
      const my = mouseRef.current.y * dpr;
      const ir = interactionRadius * dpr;

      const cellW = (w * dpr) / cols;
      const cellH = (h * dpr) / rows;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const nx = (col + 0.5) * cellW;
          const ny = (row + 0.5) * cellH;

          const dx = mx - nx;
          const dy = my - ny;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const isInteracting = !reduced && !isMobile && dist < ir;
          const intensity = isInteracting ? Math.max(0, 1 - dist / ir) : 0;

          const scale = isInteracting ? 1 + intensity * 1.4 : 1;
          const radius = (1.6 * dpr * scale) / 2;

          ctx.beginPath();
          ctx.arc(nx, ny, radius, 0, Math.PI * 2);

          if (isInteracting) {
            ctx.fillStyle = `rgba(154, 116, 46, ${0.28 + intensity * 0.52})`;
          } else {
            ctx.fillStyle = 'rgba(20, 19, 17, 0.11)';
          }

          ctx.fill();
        }
      }
    },
    [cols, rows, interactionRadius, reduced, isMobile],
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      sizeRef.current = { width: rect.width, height: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      draw(ctx, rect.width, rect.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '80px' },
    );
    io.observe(container);

    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [draw]);

  useEffect(() => {
    if (reduced || isMobile) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scheduleDraw = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!visibleRef.current) return;
        const { width, height } = sizeRef.current;
        draw(ctx, width, height);
      });
    };

    const onMove = (e: MouseEvent) => {
      if (!visibleRef.current) return;
      const r = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      };
      scheduleDraw();
    };

    const onLeave = () => {
      mouseRef.current = { x: -1e4, y: -1e4 };
      scheduleDraw();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [draw, reduced, isMobile]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-transparent"
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ imageRendering: 'auto' }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(250,248,244,0.88)_92%)]" />
    </div>
  );
}
