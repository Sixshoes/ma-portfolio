'use client';

import React, { memo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EDITORIAL_EASE } from './EditorialMotion';

type RadialRankGaugeProps = {
  universityRank: string;
  ratio: number;
  accentColor?: string;
  label: string;
};

/** 270 度純 SVG 動態圓弧全校排名儀表環（圓潤筆觸、進視窗平滑推進） */
function RadialRankGaugeComponent({
  universityRank,
  ratio,
  accentColor = '#F3DF87',
  label,
}: RadialRankGaugeProps) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(1, Math.max(0.08, ratio));
  const r = 56;
  const C = 2 * Math.PI * r;
  const arcMax = C * 0.75;

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      <svg
        viewBox="0 0 150 142"
        className="h-36 w-36 overflow-visible sm:h-40 sm:w-40"
        role="img"
        aria-label={`${label} #${universityRank}`}
      >
        {/* 270° 軌道底環 */}
        <circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke="#283B33"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${arcMax} ${C}`}
          transform="rotate(135 75 75)"
        />
        {/* 動態進度圓弧 */}
        <motion.circle
          cx="75"
          cy="75"
          r={r}
          fill="none"
          stroke={accentColor}
          strokeWidth="10"
          strokeLinecap="round"
          initial={
            reduceMotion
              ? { strokeDasharray: `${arcMax * clamped} ${C}` }
              : { strokeDasharray: `0 ${C}` }
          }
          whileInView={{ strokeDasharray: `${arcMax * clamped} ${C}` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: reduceMotion ? 0 : 1.0, ease: EDITORIAL_EASE }}
          transform="rotate(135 75 75)"
        />
        <text
          x="75"
          y="74"
          textAnchor="middle"
          className="font-editorial fill-[#F4F1EA] text-[34px] font-bold"
        >
          #{universityRank}
        </text>
        <text
          x="75"
          y="98"
          textAnchor="middle"
          className="fill-[#A7C4B8] font-mono text-[11.5px] uppercase tracking-[0.1em]"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

export const RadialRankGauge = memo(RadialRankGaugeComponent);
