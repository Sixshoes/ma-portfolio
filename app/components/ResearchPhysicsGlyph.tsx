'use client';

import React, { memo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EDITORIAL_EASE } from './EditorialMotion';

type ResearchPhysicsGlyphProps = {
  /** 0: 1D 奈米柱晶束, 1: 2D 鐵磁自旋陣列, 2: 電致變色光波穿透板, 3: 超級電容電場線, 4: 量子電腦布洛赫球 */
  index: number;
  isActive: boolean;
  /** editorial: 56px 墨色微圖騰；blueprint: 132px 黑板粉筆大型科學藍圖 */
  variant?: 'editorial' | 'blueprint';
  chalkAccent?: string;
};

type Palette = {
  ink: string;
  accent: string;
  sizeClass: string;
};

function drawProps(isActive: boolean, reduce: boolean | null, delay = 0) {
  if (reduce) {
    return {
      initial: { pathLength: 1, opacity: 1 },
      animate: { pathLength: 1, opacity: 1 },
    };
  }
  return {
    initial: { pathLength: 1 },
    animate: isActive ? { pathLength: [0, 1] } : { pathLength: 1 },
    transition: {
      duration: 0.5,
      delay,
      ease: EDITORIAL_EASE,
    },
  };
}

/** 01. 六角奈米柱晶束（1D Nanomaterials） */
function NanorodGlyph({
  isActive,
  reduce,
  palette,
}: {
  isActive: boolean;
  reduce: boolean | null;
  palette: Palette;
}) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={`${palette.sizeClass} overflow-visible`}
    >
      <motion.path
        d="M11 16 L15 14 L18 16.5 L25 46 L21 47.5 L11 16 Z"
        stroke={palette.ink}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0.04)}
      />
      <motion.path
        d="M15 14 L22.5 46.5"
        stroke={palette.ink}
        strokeWidth="0.9"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.08)}
      />
      <motion.path
        d="M25 8 L28.5 6.5 L32 8 L32 10.5 L28.5 12 L25 10.5 Z"
        stroke={palette.accent}
        strokeWidth="1.3"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0)}
      />
      <motion.path
        d="M25 10.5 L23.5 48.5 L27.5 50 L30.5 48.5 L32 10.5"
        stroke={palette.ink}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0.02)}
      />
      <motion.path
        d="M28.5 12 L27.5 50"
        stroke={palette.accent}
        strokeWidth="1.15"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.1)}
      />
      <motion.path
        d="M41 20 L44.5 21.5 L45 24 L31.5 49.5 L28 48 L41 20 Z"
        stroke={palette.ink}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0.07)}
      />
      <motion.path
        d="M43 22.8 L30 48.8"
        stroke={palette.accent}
        strokeWidth="1"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.12)}
      />
    </svg>
  );
}

/** 02. 二維鐵磁自旋箭頭陣列（2D Ferromagnetic Materials） */
function FerromagneticSpinGlyph({
  isActive,
  reduce,
  palette,
}: {
  isActive: boolean;
  reduce: boolean | null;
  palette: Palette;
}) {
  const xs = [13, 28, 43];
  const ys = [17, 31, 45];
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={`${palette.sizeClass} overflow-visible`}
    >
      <motion.path
        d="M11 17 H45 M11 31 H45 M11 45 H45 M13 15 V47 M28 15 V47 M43 15 V47"
        stroke={palette.ink}
        strokeWidth="0.9"
        strokeOpacity="0.65"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0)}
      />
      <motion.path
        d="M13 31 L28 17 M13 45 L43 17 M28 45 L43 31"
        stroke={palette.ink}
        strokeWidth="0.85"
        strokeOpacity="0.45"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.05)}
      />
      {xs.map((x, xi) =>
        ys.map((y, yi) => {
          const idx = xi + yi;
          return (
            <motion.g
              key={`${x}-${y}`}
              style={{ transformOrigin: `${x}px ${y}px` }}
              animate={
                reduce
                  ? { rotate: 0, y: 0 }
                  : isActive
                    ? { rotate: 0, y: -1.5 }
                    : { rotate: (xi - 1) * 10, y: 0 }
              }
              transition={{ duration: 0.42, delay: idx * 0.03, ease: EDITORIAL_EASE }}
            >
              <motion.path
                d={`M${x} ${y + 3} V${y - 7} M${x - 2.4} ${y - 4.2} L${x} ${y - 7.3} L${x + 2.4} ${y - 4.2}`}
                stroke={palette.accent}
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                {...drawProps(isActive, reduce, 0.06 + idx * 0.025)}
              />
            </motion.g>
          );
        }),
      )}
    </svg>
  );
}

/** 03. 電致變色光波穿透板（Electrochromism） */
function ElectrochromismGlyph({
  isActive,
  reduce,
  palette,
}: {
  isActive: boolean;
  reduce: boolean | null;
  palette: Palette;
}) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={`${palette.sizeClass} overflow-visible`}
    >
      <motion.polygon
        points="20,16 38,6 38,40 20,50"
        fill={palette.accent}
        initial={{ fillOpacity: 0.06 }}
        animate={{ fillOpacity: isActive ? 0.2 : 0.08 }}
        transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
      />
      <motion.path
        d="M20 16 L38 6 L38 40 L20 50 Z M20 16 L18 15 L18 49 L20 50 M18 15 L36 5 L38 6"
        stroke={palette.ink}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0)}
      />
      <motion.path
        d="M5 42 L51 16"
        stroke={palette.ink}
        strokeWidth="0.85"
        strokeDasharray="2 2.5"
        strokeOpacity="0.6"
        {...drawProps(isActive, reduce, 0.05)}
      />
      <motion.path
        d="M6 41 C9 30, 12 30, 15 36 C18 42, 20 39, 23 30 C26 20, 29 22, 32 27 C35 32, 37 26, 40 20 C42.5 15, 45 16, 48 18"
        stroke={palette.accent}
        strokeWidth="1.35"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.08)}
      />
      <motion.path
        d="M46.5 15.8 L51.2 15.8 L48.8 19.8"
        stroke={palette.accent}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0.22)}
      />
    </svg>
  );
}

/** 04. 超級電容器平行板電場線（Supercapacitors） */
function SupercapacitorGlyph({
  isActive,
  reduce,
  palette,
}: {
  isActive: boolean;
  reduce: boolean | null;
  palette: Palette;
}) {
  const fieldYs = [15, 21.5, 28, 34.5, 41];
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={`${palette.sizeClass} overflow-visible`}
    >
      <motion.rect
        x="12"
        y="11"
        width="3.2"
        height="34"
        rx="1"
        stroke={palette.ink}
        strokeWidth="1.2"
        {...drawProps(isActive, reduce, 0)}
      />
      <motion.rect
        x="40.8"
        y="11"
        width="3.2"
        height="34"
        rx="1"
        stroke={palette.ink}
        strokeWidth="1.2"
        {...drawProps(isActive, reduce, 0.03)}
      />
      <path d="M6.5 13 H9.5 M8 11.5 V14.5 M46.5 13 H49.5" stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" />
      <motion.path
        d="M15.2 11.5 C21 6.5, 35 6.5, 40.8 11.5 M15.2 44.5 C21 49.5, 35 49.5, 40.8 44.5"
        stroke={palette.ink}
        strokeWidth="0.95"
        strokeOpacity="0.65"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.08)}
      />
      {fieldYs.map((y, idx) => (
        <g key={y}>
          <motion.path
            d={`M15.5 ${y} H40.5`}
            stroke={palette.ink}
            strokeWidth="1.05"
            strokeLinecap="round"
            {...drawProps(isActive, reduce, 0.05 + idx * 0.03)}
          />
          <motion.path
            d={`M26.5 ${y - 2} L30.2 ${y} L26.5 ${y + 2}`}
            stroke={palette.accent}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...drawProps(isActive, reduce, 0.12 + idx * 0.03)}
          />
        </g>
      ))}
    </svg>
  );
}

/** 05. 量子電腦布洛赫球態向量（Quantum Computer） */
function BlochSphereGlyph({
  isActive,
  reduce,
  palette,
}: {
  isActive: boolean;
  reduce: boolean | null;
  palette: Palette;
}) {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
      className={`${palette.sizeClass} overflow-visible`}
    >
      <motion.circle
        cx="28"
        cy="28"
        r="17"
        stroke={palette.ink}
        strokeWidth="1.25"
        {...drawProps(isActive, reduce, 0)}
      />
      <motion.ellipse
        cx="28"
        cy="28"
        rx="17"
        ry="5.6"
        stroke={palette.ink}
        strokeWidth="0.95"
        strokeDasharray="2.2 2"
        strokeOpacity="0.7"
        {...drawProps(isActive, reduce, 0.04)}
      />
      <motion.ellipse
        cx="28"
        cy="28"
        rx="6"
        ry="17"
        stroke={palette.ink}
        strokeWidth="0.9"
        strokeOpacity="0.45"
        {...drawProps(isActive, reduce, 0.06)}
      />
      <motion.path
        d="M28 5.5 V50 M7 28 H49.5 M37 22 L17.5 35.5"
        stroke={palette.ink}
        strokeWidth="0.95"
        strokeLinecap="round"
        strokeOpacity="0.75"
        {...drawProps(isActive, reduce, 0.08)}
      />
      <path d="M26.2 7.8 L28 5 L29.8 7.8 M47.2 26.2 L50 28 L47.2 29.8" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <motion.g
        style={{ transformOrigin: '28px 28px' }}
        animate={reduce ? { rotate: 0 } : isActive ? { rotate: 0 } : { rotate: -12 }}
        transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
      >
        <motion.path
          d="M28 28 L37.8 16.2"
          stroke={palette.accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          {...drawProps(isActive, reduce, 0.12)}
        />
        <motion.path
          d="M34 16.7 L38.2 15.8 L37.6 20"
          stroke={palette.accent}
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...drawProps(isActive, reduce, 0.2)}
        />
      </motion.g>
      <circle cx="28" cy="28" r="1.4" fill={palette.ink} />
    </svg>
  );
}

function ResearchPhysicsGlyphComponent({
  index,
  isActive,
  variant = 'editorial',
  chalkAccent = '#F3DF87',
}: ResearchPhysicsGlyphProps) {
  const reduce = useReducedMotion();

  const isBlueprint = variant === 'blueprint';
  const palette: Palette = isBlueprint
    ? {
        ink: '#E6ECE8',
        accent: chalkAccent,
        sizeClass: 'h-32 w-32',
      }
    : {
        ink: 'var(--app-ink)',
        accent: 'var(--app-accent)',
        sizeClass: 'h-14 w-14',
      };

  const renderGlyph = () => {
    switch (index % 5) {
      case 0:
        return <NanorodGlyph isActive={isActive} reduce={reduce} palette={palette} />;
      case 1:
        return <FerromagneticSpinGlyph isActive={isActive} reduce={reduce} palette={palette} />;
      case 2:
        return <ElectrochromismGlyph isActive={isActive} reduce={reduce} palette={palette} />;
      case 3:
        return <SupercapacitorGlyph isActive={isActive} reduce={reduce} palette={palette} />;
      default:
        return <BlochSphereGlyph isActive={isActive} reduce={reduce} palette={palette} />;
    }
  };

  return (
    <motion.div
      aria-hidden="true"
      animate={{
        opacity: isBlueprint ? (isActive ? 1 : 0.84) : isActive ? 1 : 0.15,
        scale: isActive && !reduce ? 1.05 : 1,
      }}
      transition={{ duration: 0.35, ease: EDITORIAL_EASE }}
      className={
        isBlueprint
          ? 'flex h-36 w-36 shrink-0 items-center justify-center'
          : 'flex h-14 w-14 shrink-0 items-center justify-center'
      }
    >
      {renderGlyph()}
    </motion.div>
  );
}

export const ResearchPhysicsGlyph = memo(ResearchPhysicsGlyphComponent);
