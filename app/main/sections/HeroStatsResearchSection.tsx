'use client';

import React, { memo, useCallback, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import {
  EDITORIAL_EASE,
  InkRule,
  MaskedTextReveal,
  RollingNumber,
} from '@/app/components/EditorialMotion';
import { ResearchPhysicsGlyph } from '@/app/components/ResearchPhysicsGlyph';
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
};

function HeroStatsResearchSectionComponent({
  heroText,
  statsText,
  researchText,
  lang,
  totalPubs,
  totalCitations,
  hIndexValue,
}: HeroStatsResearchSectionProps) {
  useRenderProfiler('HeroStatsResearchSection');
  const reduceMotion = useReducedMotion();
  const [isImgError, setIsImgError] = useState(false);
  const [hoveredResearchIdx, setHoveredResearchIdx] = useState<number | null>(null);
  const onImgError = useCallback(() => setIsImgError(true), []);
  const displayHIndex = hIndexValue ?? statsText.hIndexValue;

  // 裝裱肖像內層微視差景深（-10px -> +14px）
  const portraitFrameRef = useRef<HTMLElement>(null);
  const { scrollYProgress: portraitProgress } = useScroll({
    target: portraitFrameRef,
    offset: ['start end', 'end start'],
  });
  const portraitParallaxY = useTransform(portraitProgress, [0, 1], [-10, 14]);

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    },
    [],
  );

  const isZh = lang === 'zh';
  const institutionLine = isZh
    ? '佛光大學副校長暨講座教授 · 國立東華大學特聘教授'
    : 'Vice President & Chair Professor, Fo Guang University · Distinguished Professor, NDHU';
  const heroPrimaryName = isZh ? '馬遠榮' : 'Prof. Yuan-Ron Ma';
  const heroLabHeadline = isZh
    ? '先進材料與量子元件實驗室'
    : 'Advanced Materials & Quantum Devices';
  const secondaryCtaLabel = isZh ? '學術歷程' : 'Academic Journey';
  const portraitName = isZh ? '馬遠榮 副校長' : 'Prof. Yuan-Ron Ma';
  const portraitAffiliation = isZh
    ? '佛光大學 · 國立東華大學'
    : 'Fo Guang University · NDHU';
  const portraitAlt = isZh
    ? '馬遠榮副校長肖像照'
    : 'Portrait of Prof. Yuan-Ron Ma';

  return (
    <>
      <section
        id="top"
        className="mx-auto max-w-6xl px-6 pb-20 pt-28 md:pb-24 md:pt-36"
      >
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12 md:items-center md:gap-10 lg:gap-14">
          {/* 左欄：首屏 0–1,100ms 錯位編排（尺規繪線 → 活字遮罩揭幕 → 精密數據跳表） */}
          <div className="flex flex-col justify-between md:col-span-7">
            <div>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.48, delay: 0.06, ease: EDITORIAL_EASE }}
                className="mb-4 text-sm text-[#5C5953]"
              >
                {institutionLine}
              </motion.p>

              <h1 className="font-editorial mb-6 text-[#141413]">
                <MaskedTextReveal
                  delay={0.12}
                  duration={0.63}
                  innerClassName="text-4xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-5xl lg:text-[3.35rem]"
                >
                  {heroPrimaryName}
                </MaskedTextReveal>
                <MaskedTextReveal
                  delay={0.2}
                  duration={0.63}
                  className="mt-2"
                  innerClassName="text-2xl font-medium leading-[1.25] tracking-[-0.015em] text-[#2D2C29] sm:text-3xl lg:text-[2.1rem]"
                >
                  {heroLabHeadline}
                </MaskedTextReveal>
              </h1>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.56, delay: 0.26, ease: EDITORIAL_EASE }}
                className="mb-8 max-w-xl text-[15px] leading-[1.8] text-[#2D2C29] md:text-base"
              >
                {heroText.desc}
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.54, delay: 0.32, ease: EDITORIAL_EASE }}
                className="flex flex-wrap items-center gap-3.5"
              >
                <a
                  href="#publications"
                  onClick={(e) => scrollToSection(e, 'publications')}
                  className={`${uiTokens.buttonPrimary} inline-flex items-center gap-2 px-6 py-3 text-sm`}
                >
                  {heroText.cta}
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="#about"
                  onClick={(e) => scrollToSection(e, 'about')}
                  className={`${uiTokens.buttonOutline} inline-flex items-center px-6 py-3 text-sm`}
                >
                  {secondaryCtaLabel}
                </a>
              </motion.div>
            </div>

            {/* 三大統計數據：上下 1px 墨黑鋼筆尺規繪線夾住 + 0.85s tabular-nums 滾動跳表 */}
            <div className="mt-12">
              <InkRule dark immediate delay={0} />
              <div className="grid grid-cols-3 divide-x divide-[#D4D1C8] py-6">
                {[
                  { label: statsText.pubs, value: totalPubs },
                  { label: statsText.citations, value: totalCitations },
                  { label: statsText.hIndex, value: displayHIndex },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={i > 0 ? 'pl-4 sm:pl-6' : 'pr-4'}
                  >
                    <div className="font-editorial text-3xl font-semibold tracking-tight text-[#141413] sm:text-4xl">
                      <RollingNumber
                        value={stat.value}
                        delay={0.25 + i * 0.06}
                        duration={0.85}
                      />
                    </div>
                    <div className="mt-1 text-xs text-[#5C5953]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <InkRule dark immediate delay={0.08} />
            </div>
            <p className="mt-3 text-xs text-[#5C5953]">{statsText.scopusNote}</p>
          </div>

          {/* 右欄：直角裝裱霧暖礦石灰肖像框（暗房顯影 scale 1.04->1 + 微視差景深 -10px->+14px + 700ms 藝廊推進） */}
          <div className="md:col-span-5">
            <motion.figure
              ref={portraitFrameRef}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.74, delay: 0.18, ease: EDITORIAL_EASE }}
              className="group/portrait mx-auto w-full max-w-[380px] border border-[#141413] bg-[#F7F6F2] p-2.5 md:ml-auto md:mr-0"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#E6E4DD]">
                {isImgError ? (
                  <div className="font-editorial flex h-full w-full items-center justify-center text-3xl font-semibold tracking-widest text-[#5C5953]">
                    YRM
                  </div>
                ) : (
                  <motion.div
                    initial={reduceMotion ? false : { scale: 1.04, opacity: 0.01 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.74,
                      delay: 0.18,
                      ease: EDITORIAL_EASE,
                    }}
                    style={reduceMotion ? undefined : { y: portraitParallaxY }}
                    className="absolute -inset-y-4 inset-x-0 will-change-transform"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/profile.jpg"
                      alt={portraitAlt}
                      fetchPriority="high"
                      onError={onImgError}
                      className="h-full w-full object-cover object-top mix-blend-multiply contrast-[1.03] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/portrait:scale-[1.025]"
                    />
                  </motion.div>
                )}
              </div>
              <figcaption className="mt-2.5 border-t border-[#D4D1C8] pt-2.5 text-xs text-[#4A4843]">
                <span className="font-semibold text-[#141413]">{portraitName}</span>
                <span className="mx-1.5">·</span>
                <span>{portraitAffiliation}</span>
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </section>

      {/* 五大研究領域：01.–05. 電致變色由左至右橫掃底襯 + 列尾銅版細墨線物理幾何圖騰 */}
      <section
        id="research"
        className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:py-24"
      >
        <div className="pb-4">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <h2 className={uiTokens.sectionTitle}>
              {researchText.title}
              {lang === 'en' ? ' ' : ''}
              {researchText.subtitle}
            </h2>
            <p className="max-w-sm text-sm text-[#5C5953] md:text-right">
              {researchText.desc}
            </p>
          </div>
        </div>
        <InkRule thick />

        <ol className="divide-y divide-[#D4D1C8]">
          {researchText.items.map((item, i) => {
            const num = `${String(i + 1).padStart(2, '0')}.`;
            const isActive = hoveredResearchIdx === i;
            return (
              <li
                key={item.title}
                tabIndex={0}
                onMouseEnter={() => setHoveredResearchIdx(i)}
                onMouseLeave={() => setHoveredResearchIdx((prev) => (prev === i ? null : prev))}
                onFocus={() => setHoveredResearchIdx(i)}
                onBlur={() => setHoveredResearchIdx((prev) => (prev === i ? null : prev))}
                className="group relative overflow-hidden px-3 py-6 focus:outline-none md:px-4"
              >
                {/* 電致變色薄膜橫掃底襯（origin-left scale-x-0 -> scale-x-100） */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-[#ECE9E1] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                />
                {/* 左側極細牛津深藍通電指示邊線 */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 top-0 w-[2px] origin-top scale-y-0 bg-[#1B365D] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
                />

                <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center md:gap-6">
                  <div className="flex items-center justify-between md:col-span-1 md:block">
                    <span className="font-editorial inline-block text-lg font-medium text-[#141413] [font-variant-numeric:tabular-nums] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-hover:text-[#1B365D] group-focus-visible:translate-x-1.5 group-focus-visible:text-[#1B365D] motion-reduce:transition-none">
                      {num}
                    </span>
                    <div className="md:hidden">
                      <ResearchPhysicsGlyph index={i} isActive={isActive} />
                    </div>
                  </div>

                  <h3 className="font-editorial text-xl font-semibold text-[#141413] transition-colors duration-300 group-hover:text-[#1B365D] md:col-span-3">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-[1.75] text-[#2D2C29] md:col-span-6">
                    {item.desc}
                  </p>

                  <div className="hidden justify-end md:col-span-2 md:flex">
                    <ResearchPhysicsGlyph index={i} isActive={isActive} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <InkRule dark />
      </section>
    </>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
