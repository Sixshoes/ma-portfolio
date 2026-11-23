'use client';

import React, { memo, useCallback, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowDownRight } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { HeroLatticeBackground } from '@/app/components/HeroLatticeBackground';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';

type HeroText = {
  role: string;
  title1: string;
  title2: string;
  title3: string;
  title4: string;
  desc: string;
  cta: string;
};

type StatsText = {
  pubs: string;
  citations: string;
  hIndex: string;
  hIndexValue: string;
  scopusNote: string;
};

type ResearchItem = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ResearchText = {
  title: string;
  subtitle: string;
  desc: string;
  items: ResearchItem[];
};

type HeroStatsResearchSectionProps = {
  heroText: HeroText;
  statsText: StatsText;
  researchText: ResearchText;
  lang: 'en' | 'zh';
  totalPubs: number | string;
  totalCitations: number | string;
  hIndexValue?: number | string;
  isMobile: boolean;
  prefersReducedMotion: boolean | null;
};

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;

function formatStatValue(val: number | string): string {
  return typeof val === 'number' ? val.toLocaleString('en-US') : val;
}

/** 具備滑鼠微光追蹤的建築細線研究領域格 */
function SpotlightResearchCell({
  item,
  index,
  spanClass,
  lite,
}: {
  item: ResearchItem;
  index: number;
  spanClass: string;
  lite: boolean;
}) {
  const [spot, setSpot] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (lite) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
    },
    [lite],
  );

  const handleMouseLeave = useCallback(() => {
    setSpot((prev) => (prev.active ? { ...prev, active: false } : prev));
  }, []);

  const roman = ROMAN_NUMERALS[index] ?? String(index + 1);
  const Icon = item.icon;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${spanClass} group relative overflow-hidden bg-[#0c0b0a] p-8 transition-colors duration-300 hover:bg-[#100f0d] md:p-10`}
    >
      {/* 滑鼠追光金屬微暈 */}
      {!lite ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: spot.active ? 1 : 0,
            background: `radial-gradient(380px circle at ${spot.x}px ${spot.y}px, rgba(200, 164, 100, 0.11), transparent 62%)`,
          }}
        />
      ) : null}

      {/* 頂部細金線 hover 展開 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#c8a464] via-[#e5cea0]/60 to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-8 flex items-center justify-between">
          <span className="font-heading-serif text-lg italic tracking-wider text-[#c8a464]/80">
            {roman}
          </span>
          <Icon className="h-5 w-5 stroke-[1.25] text-[#8f8980] transition-colors duration-300 group-hover:text-[#e2c992]" />
        </div>

        <h3 className="font-heading-serif mb-3 text-2xl font-medium tracking-tight text-[#f5f3ef] transition-colors duration-300 group-hover:text-[#e5cea0]">
          {item.title}
        </h3>
        <p className="text-sm font-light leading-relaxed text-[#9e988f] transition-colors duration-300 group-hover:text-[#c4bfb6]">
          {item.desc}
        </p>
      </div>
    </div>
  );
}

function HeroStatsResearchSectionComponent({
  heroText,
  statsText,
  researchText,
  lang,
  totalPubs,
  totalCitations,
  hIndexValue,
  isMobile,
  prefersReducedMotion,
}: HeroStatsResearchSectionProps) {
  useRenderProfiler('HeroStatsResearchSection');
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isImgError, setIsImgError] = useState(false);
  const onImgLoaded = useCallback(() => setIsImgLoaded(true), []);
  const onImgError = useCallback(() => setIsImgError(true), []);
  const lenis = useLenis();
  const lite = Boolean(prefersReducedMotion) || isMobile;
  const displayHIndex = hIndexValue ?? statsText.hIndexValue;

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (lenis && !isMobile) {
        lenis.scrollTo(target, { offset: -72, duration: 0.85 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.history.replaceState(null, '', `#${id}`);
    },
    [lenis, isMobile],
  );

  const secondaryCtaLabel = lang === 'zh' ? '學術歷程' : 'Academic Journey';
  const portraitName = lang === 'zh' ? '馬遠榮 副校長' : 'Prof. Yuan-Ron Ma';
  const portraitAffiliation =
    lang === 'zh'
      ? '佛光大學講座教授 · 東華大學特聘教授'
      : 'Fo Guang University · National Dong Hwa University';
  const researchKicker = lang === 'zh' ? '研究主軸' : 'RESEARCH DOMAINS';

  const heroLeft = (
    <div className="relative z-10 flex flex-col justify-between">
      <div>
        {/* 建築式線性刊頭（取代 AI 圓角膠囊標籤） */}
        <div className="mb-7 flex items-center gap-3.5">
          <span className="h-px w-8 bg-[#c8a464]" aria-hidden />
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-[#e2c992]">
            {heroText.role}
          </span>
        </div>

        <h1 className="font-heading-serif mb-6 text-4xl leading-[1.06] tracking-[-0.025em] text-[#f5f3ef] sm:text-5xl md:text-6xl lg:text-[4.4rem]">
          <span className="text-gold-sheen font-normal italic">{heroText.title1}</span>
          <br />
          <span className="font-semibold text-[#f5f3ef]">{heroText.title2}</span>
          {heroText.title3 ? (
            <span className="font-normal text-[#c8c3ba]"> {heroText.title3}</span>
          ) : null}
          <br />
          <span className="font-normal text-[#9e988f]">{heroText.title4}</span>
        </h1>

        <p className="mb-9 max-w-xl text-base font-light leading-[1.75] text-[#b3ada4] md:text-[1.05rem]">
          {heroText.desc}
        </p>

        <div className="flex flex-wrap items-center gap-3.5">
          <a
            href="#publications"
            onClick={(e) => scrollToSection(e, 'publications')}
            className={`${uiTokens.buttonPrimaryStrong} inline-flex items-center gap-2 rounded-lg px-7 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.18em]`}
          >
            {heroText.cta}
            <ArrowDownRight className="h-4 w-4" aria-hidden />
          </a>
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, 'about')}
            className={`${uiTokens.buttonGhost} inline-flex items-center rounded-lg px-6 py-3.5 font-display text-xs font-medium uppercase tracking-[0.18em]`}
          >
            {secondaryCtaLabel}
          </a>
        </div>
      </div>

      {/* 首屏底部整合式數據橫條：進頁第一眼即見完整實績 */}
      <div className="mt-12 border-t border-white/[0.09] pt-8">
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: statsText.pubs, value: formatStatValue(totalPubs) },
            { label: statsText.citations, value: formatStatValue(totalCitations) },
            { label: statsText.hIndex, value: formatStatValue(displayHIndex) },
          ].map((stat, i) => (
            <div key={i} className={i > 0 ? 'border-l border-white/[0.08] pl-5 md:pl-6' : ''}>
              <div className="font-heading-serif text-3xl font-medium tracking-tight text-[#f5f3ef] [font-variant-numeric:lining-nums] sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8f8980]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[11px] text-[#78726a]">{statsText.scopusNote}</p>
      </div>
    </div>
  );

  const portraitColumn = (
    <figure className="relative mx-auto w-full max-w-[420px] md:ml-auto md:mr-0">
      {/* 暗棚精品人像框架：極細 1px 邊框 + 底部無縫銜接暗影 + 編輯式署名 */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-[#0e0d0c] shadow-[0_30px_80px_rgba(0,0,0,0.75)]">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {isImgError ? (
            <div className="flex h-full w-full items-center justify-center bg-[#121110] font-heading-serif text-5xl italic text-[#c8a464]/70">
              YRM
            </div>
          ) : (
            <Image
              src="/profile.jpg"
              alt="馬遠榮副校長個人照 (Prof. Y.R. Ma)"
              fill
              priority
              sizes="(max-width: 768px) 92vw, 420px"
              onLoad={onImgLoaded}
              onError={onImgError}
              className={`object-cover object-top brightness-[0.95] contrast-[1.04] transition-opacity duration-700 ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
          {/* 柔和暗棚邊緣漸暈，讓明亮棚拍背景自然融入黑曜石畫面而不影響人像主體 */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_72%_72%_at_50%_40%,transparent_44%,rgba(8,8,7,0.62)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080807] via-[#080807]/22 to-[#080807]/25" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
            <div className="mb-2 h-px w-10 bg-[#c8a464]/80" aria-hidden />
            <div className="font-heading-serif text-lg font-medium tracking-wide text-[#f5f3ef]">
              {portraitName}
            </div>
            <figcaption className="mt-0.5 font-mono text-[11px] tracking-wider text-[#b3ada4]">
              {portraitAffiliation}
            </figcaption>
          </div>
        </div>
      </div>
    </figure>
  );

  return (
    <>
      <section className="relative mx-auto max-w-7xl overflow-hidden px-6 pb-20 pt-28 md:pb-28 md:pt-36">
        <HeroLatticeBackground isMobile={isMobile} prefersReducedMotion={prefersReducedMotion} />
        <div className="relative z-10 grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-10 lg:gap-14">
          <div className="md:col-span-7">
            {lite ? (
              heroLeft
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {heroLeft}
              </motion.div>
            )}
          </div>
          <div className="md:col-span-5">
            {lite ? (
              portraitColumn
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {portraitColumn}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 研究領域：1px 無縫細線建築矩陣 + 滑鼠追光金屬質感 */}
      <section
        id="research"
        className="relative mx-auto max-w-7xl scroll-mt-24 border-t border-white/[0.08] px-6 py-24 md:py-32"
      >
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:mb-16 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-6 bg-[#c8a464]" aria-hidden />
              <span className={uiTokens.sectionKicker}>{researchKicker}</span>
            </div>
            <h2 className={uiTokens.sectionTitle}>
              <span className={uiTokens.titleLight}>{researchText.title}</span>{' '}
              <span className={uiTokens.titleBold}>{researchText.subtitle}</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm font-light leading-relaxed text-[#9e988f] md:text-right">
            {researchText.desc}
          </p>
        </div>

        {/* 無縫 1px 細線矩陣（以 gap-px 與極淡邊線構成，零圓角泡泡感） */}
        <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.08]">
          <div className="grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-6">
            {researchText.items.map((item, i) => {
              const spanClass =
                researchText.items.length === 5
                  ? i < 3
                    ? 'lg:col-span-2'
                    : i === 4
                      ? 'md:col-span-2 lg:col-span-3'
                      : 'lg:col-span-3'
                  : 'lg:col-span-2';
              return (
                <SpotlightResearchCell
                  key={i}
                  item={item}
                  index={i}
                  spanClass={spanClass}
                  lite={lite}
                />
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
