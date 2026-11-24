'use client';

import React, { memo, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Publication } from '@/lib/publications';
import { computeDomainStats } from '@/lib/researchDomains';
import { EDITORIAL_EASE } from './EditorialMotion';

type DomainDonutChartProps = {
  publications: Publication[];
  lang: 'en' | 'zh';
  activeDomainId: string | null;
  onSelectDomain: (domainId: string) => void;
};

/** 純 SVG 礦物圖鑑五色互動環狀圖（圓潤段口、懸停展開、點擊連動篩選著作） */
function DomainDonutChartComponent({
  publications,
  lang,
  activeDomainId,
  onSelectDomain,
}: DomainDonutChartProps) {
  const reduceMotion = useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isZh = lang === 'zh';

  const { segments, totalTagged } = useMemo(() => {
    const stats = computeDomainStats(publications);
    const total = stats.reduce((sum, s) => sum + s.count, 0) || 1;
    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const gap = 4.5;

    let offset = 0;
    const built = stats.map((entry) => {
      const share = entry.count / total;
      const rawLength = share * circumference;
      const dashLength = Math.max(4, rawLength - gap);
      const startOffset = offset;
      offset += rawLength;
      return {
        ...entry,
        sharePct: Math.round(share * 100),
        dashLength,
        circumference,
        startOffset,
      };
    });

    return { segments: built, totalTagged: total };
  }, [publications]);

  const focusedId = hoveredId ?? activeDomainId;
  const focused = segments.find((s) => s.domain.id === focusedId) ?? null;

  return (
    <div className="flex flex-col items-center">
      {/* 環狀圖主視覺 */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 180 180"
          className="h-44 w-44 overflow-visible sm:h-48 sm:w-48"
          role="img"
          aria-label={isZh ? '五大研究領域論文產出佔比環狀圖' : 'Research domain output distribution donut chart'}
        >
          {/* 基底淡軌道 */}
          <circle
            cx="90"
            cy="90"
            r="64"
            fill="none"
            stroke="var(--app-rule)"
            strokeOpacity="0.45"
            strokeWidth="16"
          />

          <g transform="rotate(-90 90 90)">
            {segments.map((seg, idx) => {
              const isFocused = focusedId === seg.domain.id;
              const isDimmed = Boolean(focusedId && !isFocused);
              return (
                <motion.circle
                  key={seg.domain.id}
                  cx="90"
                  cy="90"
                  r="64"
                  fill="none"
                  stroke={seg.domain.color}
                  strokeLinecap="round"
                  strokeDashoffset={-seg.startOffset}
                  initial={
                    reduceMotion
                      ? { strokeDasharray: `${seg.dashLength} ${seg.circumference}` }
                      : { strokeDasharray: `0 ${seg.circumference}` }
                  }
                  animate={{
                    strokeDasharray: `${seg.dashLength} ${seg.circumference}`,
                    strokeWidth: isFocused ? 20 : 15,
                    opacity: isDimmed ? 0.36 : 1,
                  }}
                  transition={{
                    strokeDasharray: {
                      duration: reduceMotion ? 0 : 0.85,
                      delay: reduceMotion ? 0 : 0.15 + idx * 0.08,
                      ease: EDITORIAL_EASE,
                    },
                    strokeWidth: { duration: 0.22, ease: EDITORIAL_EASE },
                    opacity: { duration: 0.22 },
                  }}
                  onMouseEnter={() => setHoveredId(seg.domain.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onSelectDomain(seg.domain.id)}
                  className="cursor-pointer outline-none"
                />
              );
            })}
          </g>
        </svg>

        {/* 中央動態焦點讀數 */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {focused ? (
            <>
              <span
                className="font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: focused.domain.color }}
              >
                {focused.domain.roman} · {focused.sharePct}%
              </span>
              <span className="font-editorial mt-0.5 text-2xl font-semibold text-[var(--app-ink)] [font-variant-numeric:tabular-nums]">
                {focused.count}
              </span>
              <span className="mt-0.5 line-clamp-1 max-w-[100px] text-[11px] font-medium text-[var(--app-muted)]">
                {isZh ? focused.domain.labelZh : focused.domain.labelEn}
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--app-muted)]">
                {isZh ? '五大領域' : '5 DOMAINS'}
              </span>
              <span className="font-editorial mt-0.5 text-2xl font-semibold text-[var(--app-ink)] [font-variant-numeric:tabular-nums]">
                {publications.length || totalTagged}
              </span>
              <span className="text-[11px] text-[var(--app-muted)]">
                {isZh ? '篇著作' : 'works'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 圓角膠囊式礦物五色圖例（點擊直接篩選論文） */}
      <div className="mt-4 flex w-full flex-wrap justify-center gap-1.5">
        {segments.map((seg) => {
          const isFocused = focusedId === seg.domain.id;
          return (
            <button
              key={seg.domain.id}
              type="button"
              onMouseEnter={() => setHoveredId(seg.domain.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectDomain(seg.domain.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all duration-200 ${
                isFocused
                  ? 'border-[var(--app-ink)] bg-[var(--app-hover)] font-semibold text-[var(--app-ink)]'
                  : 'border-[var(--app-rule)] bg-[var(--app-bg)]/60 text-[var(--app-body)] hover:border-[var(--app-ink)]'
              }`}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: seg.domain.color }}
                aria-hidden
              />
              <span className="truncate">
                {isZh ? seg.domain.labelZh : seg.domain.labelEn.replace(' Materials', '')}
              </span>
              <span className="font-mono text-[10px] text-[var(--app-muted)] [font-variant-numeric:tabular-nums]">
                {seg.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const DomainDonutChart = memo(DomainDonutChartComponent);
