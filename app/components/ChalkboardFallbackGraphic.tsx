'use client';

import React, { memo } from 'react';

type ChalkboardFallbackGraphicProps = {
  /** 是否在右緣疊入馬副校長肖像剪影（首屏無實拍黑板原圖時作為高質感過渡） */
  showPortraitHint?: boolean;
  className?: string;
};

/**
 * 量子穿隧效應與 STM 矩形位能障穿透係數粉筆手稿精繪向量板：
 * 僅在 public/chalkboard-quantum-tunneling.jpg 尚未置入或尚未從 /admin 上傳實拍黑板照時自動啟用，
 * 確保零破圖且完整重現鵝黃 (#F3DF87) 與珊瑚粉紅 (#E88D84) 粉筆手稿美學。
 */
function ChalkboardFallbackGraphicComponent({
  showPortraitHint = false,
  className = '',
}: ChalkboardFallbackGraphicProps) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[#1B3329] ${className}`.trim()}
    >
      <svg
        viewBox="0 0 640 420"
        className="h-full w-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="Quantum Tunneling & STM Barrier Transmission chalkboard derivation"
      >
        <defs>
          <radialGradient id="chalkGlow" cx="38%" cy="42%" r="65%">
            <stop offset="0%" stopColor="#264739" />
            <stop offset="100%" stopColor="#14271F" />
          </radialGradient>
        </defs>
        <rect width="640" height="420" fill="url(#chalkGlow)" />

        {/* 極淡黑板擦拭痕與格線 */}
        <g stroke="#F4F1EA" strokeOpacity="0.06" strokeWidth="1">
          <line x1="0" y1="105" x2="640" y2="105" />
          <line x1="0" y1="210" x2="640" y2="210" />
          <line x1="0" y1="315" x2="640" y2="315" />
        </g>

        {/* 左上粉筆推導算式：雙曲函數展開 sinh(κL), cosh(κL) */}
        <g
          fontFamily="var(--font-newsreader), Georgia, serif"
          fontStyle="italic"
          fill="#F3DF87"
          fillOpacity="0.92"
        >
          <text x="34" y="54" fontSize="18">
            ψ₁(x) = A e^(ikx) + B e^(−ikx)
          </text>
          <text x="34" y="88" fontSize="17" fill="#F4F1EA" fillOpacity="0.86">
            ψ₂(x) = C e^(κx) + D e^(−κx),   κ = √[2m(V₀ − E)] / ℏ
          </text>
          <text x="34" y="122" fontSize="16" fill="#E88D84" fillOpacity="0.92">
            A / F = [ cosh(κL) + i (κ² − k²) / (2kκ) · sinh(κL) ] e^(ikL)
          </text>
        </g>

        {/* 核心穿透係數框式：T = |F/A|² */}
        <g>
          <rect
            x="30"
            y="146"
            width="368"
            height="54"
            rx="12"
            fill="#14261E"
            fillOpacity="0.65"
            stroke="#F3DF87"
            strokeOpacity="0.7"
            strokeWidth="1.4"
            strokeDasharray="6 3"
          />
          <text
            x="48"
            y="179"
            fontFamily="var(--font-jetbrains-mono), monospace"
            fontSize="15.5"
            fill="#F3DF87"
          >
            T = |F/A|² = [ 1 + V₀² sinh²(κL) / 4E(V₀−E) ]⁻¹
          </text>
        </g>

        {/* 下方矩形位能障與量子波包穿隧衰減示意圖 */}
        <g transform="translate(34, 232)">
          {/* 坐標軸 */}
          <line x1="0" y1="110" x2="365" y2="110" stroke="#F4F1EA" strokeOpacity="0.55" strokeWidth="1.2" />
          <line x1="18" y1="126" x2="18" y2="8" stroke="#F4F1EA" strokeOpacity="0.55" strokeWidth="1.2" />

          {/* 矩形位能障 V₀ (Barrier L) */}
          <rect
            x="130"
            y="22"
            width="92"
            height="88"
            rx="4"
            fill="#E88D84"
            fillOpacity="0.14"
            stroke="#E88D84"
            strokeWidth="1.6"
          />
          <text x="176" y="16" textAnchor="middle" fontFamily="var(--font-jetbrains-mono), monospace" fontSize="11.5" fill="#E88D84">
            Barrier V₀ (Width L)
          </text>

          {/* 能階 E 虛線 */}
          <line x1="18" y1="68" x2="352" y2="68" stroke="#F3DF87" strokeOpacity="0.45" strokeDasharray="4 4" strokeWidth="1" />
          <text x="348" y="62" textAnchor="end" fontFamily="var(--font-jetbrains-mono), monospace" fontSize="11" fill="#F3DF87">
            E &lt; V₀
          </text>

          {/* 區域 I 入射高振幅正弦波 */}
          <path
            d="M 20 68 Q 34 32, 48 68 T 76 68 T 104 68 T 130 68"
            fill="none"
            stroke="#F3DF87"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          {/* 區域 II 障壁內指數衰減波 */}
          <path
            d="M 130 68 C 155 48, 185 58, 222 68"
            fill="none"
            stroke="#E88D84"
            strokeWidth="2.2"
            strokeDasharray="4 2"
            strokeLinecap="round"
          />
          {/* 區域 III 穿隧透射小振幅波 */}
          <path
            d="M 222 68 Q 236 55, 250 68 T 278 68 T 306 68 T 334 68"
            fill="none"
            stroke="#F3DF87"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          {/* 穿隧方向箭頭 */}
          <path d="M 332 68 L 348 68 M 342 63 L 349 68 L 342 73" fill="none" stroke="#F3DF87" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* 右上 STM 探針與樣品費米能階示意 */}
        <g transform="translate(442, 46)" opacity={showPortraitHint ? 0.45 : 0.92}>
          <path
            d="M 36 0 L 140 0 L 96 66 Q 88 78, 80 66 Z"
            fill="#F4F1EA"
            fillOpacity="0.08"
            stroke="#F4F1EA"
            strokeOpacity="0.65"
            strokeWidth="1.4"
          />
          <text x="88" y="34" textAnchor="middle" fontFamily="var(--font-jetbrains-mono), monospace" fontSize="11" fill="#F3DF87">
            STM Tip
          </text>
          {/* 穿隧電流箭頭 */}
          <path d="M 88 76 V 106 M 82 99 L 88 108 L 94 99" stroke="#E88D84" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          {/* 樣品表面 */}
          <rect x="20" y="114" width="136" height="24" rx="6" fill="#F3DF87" fillOpacity="0.1" stroke="#F3DF87" strokeOpacity="0.6" strokeWidth="1.3" />
          <text x="88" y="130" textAnchor="middle" fontFamily="var(--font-jetbrains-mono), monospace" fontSize="10.5" fill="#F4F1EA">
            Sample (E_F)
          </text>
        </g>
      </svg>

      {showPortraitHint ? (
        <div className="pointer-events-none absolute bottom-16 right-4 hidden h-28 w-28 overflow-hidden rounded-full border-2 border-[#F3DF87]/70 bg-[#DDD9CE] shadow-lg sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/profile.jpg"
            alt=""
            className="h-full w-full object-cover object-top mix-blend-multiply contrast-[1.04]"
          />
        </div>
      ) : null}
    </div>
  );
}

export const ChalkboardFallbackGraphic = memo(ChalkboardFallbackGraphicComponent);
