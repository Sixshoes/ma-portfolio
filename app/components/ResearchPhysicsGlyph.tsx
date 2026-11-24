'use client';

import React, { memo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EDITORIAL_EASE } from './EditorialMotion';

type ResearchPhysicsGlyphProps = {
  /** 0: 1D 奈米柱晶束, 1: 2D 鐵磁自旋陣列, 2: 電致變色光波穿透板, 3: 超級電容電場線, 4: 量子電腦布洛赫球 */
  index: number;
  isActive: boolean;
};

const INK = 'var(--app-ink)';
const OXFORD = 'var(--app-accent)';

function drawProps(isActive: boolean, reduce: boolean | null, delay = 0) {
  if (reduce) {
    return {
      initial: { pathLength: 1, opacity: 1 },
      animate: { pathLength: 1, opacity: 1 },
    };
  }
  return {
    initial: { pathLength: 1 },
    animate: isActive
      ? { pathLength: [0, 1] }
      : { pathLength: 1 },
    transition: {
      duration: 0.45,
      delay,
      ease: EDITORIAL_EASE,
    },
  };
}

/** 01. 六角奈米柱晶束（1D Nanomaterials） */
function NanorodGlyph({ isActive, reduce }: { isActive: boolean; reduce: boolean | null }) {
  return (
    <svg
      viewBox="0 0 56 56"
      width="56"
      height="56"
      fill="none"
      aria-hidden="true"
      className="h-14 w-14 overflow-visible"
    >
      {/* 左斜奈米柱 */}
      <motion.path
        d="M11 16 L15 14 L18 16.5 L25 46 L21 47.5 L11 16 Z"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0.04)}
      />
      <motion.path
        d="M15 14 L22.5 46.5"
        stroke={INK}
        strokeWidth="0.9"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.08)}
      />
      {/* 中央主六角奈米柱 */}
      <motion.path
        d="M25 8 L28.5 6.5 L32 8 L32 10.5 L28.5 12 L25 10.5 Z"
        stroke={OXFORD}
        strokeWidth="1.25"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0)}
      />
      <motion.path
        d="M25 10.5 L23.5 48.5 L27.5 50 L30.5 48.5 L32 10.5"
        stroke={INK}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0.02)}
      />
      <motion.path
        d="M28.5 12 L27.5 50"
        stroke={OXFORD}
        strokeWidth="1.1"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.1)}
      />
      {/* 右斜奈米柱 */}
      <motion.path
        d="M41 20 L44.5 21.5 L45 24 L31.5 49.5 L28 48 L41 20 Z"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0.07)}
      />
      <motion.path
        d="M43 22.8 L30 48.8"
        stroke={OXFORD}
        strokeWidth="0.95"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.12)}
      />
    </svg>
  );
}

/** 02. 二維鐵磁自旋箭頭陣列（2D Ferromagnetic Materials） */
function FerromagneticSpinGlyph({ isActive, reduce }: { isActive: boolean; reduce: boolean | null }) {
  const xs = [13, 28, 43];
  const ys = [17, 31, 45];
  return (
    <svg
      viewBox="0 0 56 56"
      width="56"
      height="56"
      fill="none"
      aria-hidden="true"
      className="h-14 w-14 overflow-visible"
    >
      {/* 二維晶格水平與斜向鍵結網 */}
      <motion.path
        d="M11 17 H45 M11 31 H45 M11 45 H45 M13 15 V47 M28 15 V47 M43 15 V47"
        stroke={INK}
        strokeWidth="0.9"
        strokeOpacity="0.65"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0)}
      />
      <motion.path
        d="M13 31 L28 17 M13 45 L43 17 M28 45 L43 31"
        stroke={INK}
        strokeWidth="0.85"
        strokeOpacity="0.45"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.05)}
      />
      {/* 同向對齊之鐵磁自旋向量箭頭 */}
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
                    : { rotate: (xi - 1) * 14, y: 0 }
              }
              transition={{ duration: 0.42, delay: idx * 0.03, ease: EDITORIAL_EASE }}
            >
              <motion.path
                d={`M${x} ${y + 3} V${y - 7} M${x - 2.4} ${y - 4.2} L${x} ${y - 7.3} L${x + 2.4} ${y - 4.2}`}
                stroke={OXFORD}
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
function ElectrochromismGlyph({ isActive, reduce }: { isActive: boolean; reduce: boolean | null }) {
  return (
    <svg
      viewBox="0 0 56 56"
      width="56"
      height="56"
      fill="none"
      aria-hidden="true"
      className="h-14 w-14 overflow-visible"
    >
      {/* 智慧變色玻璃斜透視基板（懸停通電微著牛津藍薄膜色） */}
      <motion.polygon
        points="20,16 38,6 38,40 20,50"
        fill={OXFORD}
        initial={{ fillOpacity: 0.04 }}
        animate={{ fillOpacity: isActive ? 0.14 : 0.04 }}
        transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
      />
      <motion.path
        d="M20 16 L38 6 L38 40 L20 50 Z M20 16 L18 15 L18 49 L20 50 M18 15 L36 5 L38 6"
        stroke={INK}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0)}
      />
      {/* 中心光軸虛線 */}
      <motion.path
        d="M5 42 L51 16"
        stroke={INK}
        strokeWidth="0.85"
        strokeDasharray="2 2.5"
        strokeOpacity="0.6"
        {...drawProps(isActive, reduce, 0.05)}
      />
      {/* 入射與穿透調變之正弦光波 */}
      <motion.path
        d="M6 41 C9 30, 12 30, 15 36 C18 42, 20 39, 23 30 C26 20, 29 22, 32 27 C35 32, 37 26, 40 20 C42.5 15, 45 16, 48 18"
        stroke={OXFORD}
        strokeWidth="1.35"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.08)}
      />
      {/* 出射箭頭 */}
      <motion.path
        d="M46.5 15.8 L51.2 15.8 L48.8 19.8"
        stroke={OXFORD}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawProps(isActive, reduce, 0.22)}
      />
    </svg>
  );
}

/** 04. 超級電容器平行板電場線（Supercapacitors） */
function SupercapacitorGlyph({ isActive, reduce }: { isActive: boolean; reduce: boolean | null }) {
  const fieldYs = [15, 21.5, 28, 34.5, 41];
  return (
    <svg
      viewBox="0 0 56 56"
      width="56"
      height="56"
      fill="none"
      aria-hidden="true"
      className="h-14 w-14 overflow-visible"
    >
      {/* 正負平行電極板 */}
      <motion.rect
        x="12"
        y="11"
        width="3.2"
        height="34"
        stroke={INK}
        strokeWidth="1.2"
        {...drawProps(isActive, reduce, 0)}
      />
      <motion.rect
        x="40.8"
        y="11"
        width="3.2"
        height="34"
        stroke={INK}
        strokeWidth="1.2"
        {...drawProps(isActive, reduce, 0.03)}
      />
      {/* 極性記號 + / - */}
      <path d="M6.5 13 H9.5 M8 11.5 V14.5 M46.5 13 H49.5" stroke={INK} strokeWidth="1.15" strokeLinecap="round" />
      {/* 上下邊緣散射電場弧線 */}
      <motion.path
        d="M15.2 11.5 C21 6.5, 35 6.5, 40.8 11.5 M15.2 44.5 C21 49.5, 35 49.5, 40.8 44.5"
        stroke={INK}
        strokeWidth="0.95"
        strokeOpacity="0.65"
        strokeLinecap="round"
        {...drawProps(isActive, reduce, 0.08)}
      />
      {/* 均勻平行電場線與中央牛津藍方向箭頭 */}
      {fieldYs.map((y, idx) => (
        <g key={y}>
          <motion.path
            d={`M15.5 ${y} H40.5`}
            stroke={INK}
            strokeWidth="1.05"
            strokeLinecap="round"
            {...drawProps(isActive, reduce, 0.05 + idx * 0.03)}
          />
          <motion.path
            d={`M26.5 ${y - 2} L30.2 ${y} L26.5 ${y + 2}`}
            stroke={OXFORD}
            strokeWidth="1.2"
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
function BlochSphereGlyph({ isActive, reduce }: { isActive: boolean; reduce: boolean | null }) {
  return (
    <svg
      viewBox="0 0 56 56"
      width="56"
      height="56"
      fill="none"
      aria-hidden="true"
      className="h-14 w-14 overflow-visible"
    >
      {/* 球面外框 */}
      <motion.circle
        cx="28"
        cy="28"
        r="17"
        stroke={INK}
        strokeWidth="1.25"
        {...drawProps(isActive, reduce, 0)}
      />
      {/* 赤道與子午橢圓 */}
      <motion.ellipse
        cx="28"
        cy="28"
        rx="17"
        ry="5.6"
        stroke={INK}
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
        stroke={INK}
        strokeWidth="0.9"
        strokeOpacity="0.45"
        {...drawProps(isActive, reduce, 0.06)}
      />
      {/* 正交坐標軸 x, y, z */}
      <motion.path
        d="M28 5.5 V50 M7 28 H49.5 M37 22 L17.5 35.5"
        stroke={INK}
        strokeWidth="0.95"
        strokeLinecap="round"
        strokeOpacity="0.75"
        {...drawProps(isActive, reduce, 0.08)}
      />
      {/* 坐標軸端箭頭與 z 軸標示 */}
      <path d="M26.2 7.8 L28 5 L29.8 7.8 M47.2 26.2 L50 28 L47.2 29.8" stroke={INK} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      {/* 量子態向量 |ψ⟩（懸停時微幅旋入定態） */}
      <motion.g
        style={{ transformOrigin: '28px 28px' }}
        animate={reduce ? { rotate: 0 } : isActive ? { rotate: 0 } : { rotate: -14 }}
        transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
      >
        <motion.path
          d="M28 28 L37.8 16.2"
          stroke={OXFORD}
          strokeWidth="1.5"
          strokeLinecap="round"
          {...drawProps(isActive, reduce, 0.12)}
        />
        <motion.path
          d="M34 16.7 L38.2 15.8 L37.6 20"
          stroke={OXFORD}
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...drawProps(isActive, reduce, 0.2)}
        />
      </motion.g>
      <circle cx="28" cy="28" r="1.4" fill={INK} />
    </svg>
  );
}

function ResearchPhysicsGlyphComponent({ index, isActive }: ResearchPhysicsGlyphProps) {
  const reduce = useReducedMotion();

  const renderGlyph = () => {
    switch (index % 5) {
      case 0:
        return <NanorodGlyph isActive={isActive} reduce={reduce} />;
      case 1:
        return <FerromagneticSpinGlyph isActive={isActive} reduce={reduce} />;
      case 2:
        return <ElectrochromismGlyph isActive={isActive} reduce={reduce} />;
      case 3:
        return <SupercapacitorGlyph isActive={isActive} reduce={reduce} />;
      default:
        return <BlochSphereGlyph isActive={isActive} reduce={reduce} />;
    }
  };

  return (
    <motion.div
      aria-hidden="true"
      animate={{
        opacity: isActive ? 1 : 0.15,
        scale: isActive && !reduce ? 1.04 : 1,
      }}
      transition={{ duration: 0.35, ease: EDITORIAL_EASE }}
      className="flex h-14 w-14 shrink-0 items-center justify-center"
    >
      {renderGlyph()}
    </motion.div>
  );
}

export const ResearchPhysicsGlyph = memo(ResearchPhysicsGlyphComponent);
