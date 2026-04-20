'use client';

import React, { useCallback, useEffect, useRef } from 'react';

type HeroLatticeBackgroundProps = {
  isMobile?: boolean;
  prefersReducedMotion?: boolean | null;
};

/**
 * Canvas-based lattice background — replaces the previous 312-DOM-node grid
 * with a single <canvas> element for significantly less layout/paint cost.
 *
 * Desktop: animated glow follows cursor via requestAnimationFrame loop.
 * Mobile / reduced-motion: draws a static lattice once (no rAF loop).
 */
export function HeroLatticeBackground({
  isMobile = false,
  prefersReducedMotion = false,
}: HeroLatticeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1e4, y: -1e4 });
  const rafRef = useRef<number | null>(null);
  const reduced = prefersReducedMotion === true;

  const cols = isMobile ? 16 : 26;
  const rows = isMobile ? 10 : 12;
  const interactionRadius = isMobile ? 110 : 150;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
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
          const isInteracting = !reduced && dist < ir;
          const intensity = isInteracting ? Math.max(0, 1 - dist / ir) : 0;

          const scale = isInteracting ? 1 + intensity * 1.45 : 1;
          const opacity = (isInteracting ? 0.28 + intensity * 0.72 : 0.12) * 0.55;
          const radius = (1.5 * dpr * scale) / 2;

          ctx.beginPath();
          ctx.arc(nx, ny, radius, 0, Math.PI * 2);

          if (isInteracting) {
            // Gold glow colour
            const r = 196, g = 167, b = 125;
            ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
            // Glow shadow
            const glowSize = (8 + intensity * 14) * dpr;
            ctx.shadowColor = `rgba(196,167,125,${0.55 * intensity})`;
            ctx.shadowBlur = glowSize;
          } else {
            // Slate colour
            ctx.fillStyle = `rgba(71,85,105,${opacity})`;
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }

          ctx.fill();
        }
      }
      // Reset shadow after loop
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    },
    [cols, rows, interactionRadius, reduced],
  );

  // Resize handler — keeps canvas crisp on DPR changes / container resize
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      // Draw once immediately after resize
      draw(ctx, rect.width, rect.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  // Mouse tracking + animation loop (desktop only)
  useEffect(() => {
    if (reduced) return; // Static mode — already drawn in resize handler

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      };
    };

    if (!isMobile) {
      window.addEventListener('mousemove', onMove, { passive: true });
    }

    let running = true;
    const loop = () => {
      if (!running) return;
      const rect = container.getBoundingClientRect();
      draw(ctx, rect.width, rect.height);
      rafRef.current = requestAnimationFrame(loop);
    };

    // Only run continuous loop on desktop with mouse interaction
    if (!isMobile) {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      running = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (!isMobile) {
        window.removeEventListener('mousemove', onMove);
      }
    };
  }, [draw, reduced, isMobile]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-transparent"
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-[0.55]"
        style={{ imageRendering: 'auto' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(12,10,9,0.38)_55%,#0c0a09_92%)]" />
    </div>
  );
}
