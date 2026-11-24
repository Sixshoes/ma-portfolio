'use client';

import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ArrowDown, ChevronDown } from 'lucide-react';
import {
  EDITORIAL_EASE,
  InkRule,
  MaskedTextReveal,
  RollingNumber,
} from '@/app/components/EditorialMotion';
import { ResearchPhysicsGlyph } from '@/app/components/ResearchPhysicsGlyph';
import type { Publication } from '@/lib/publications';
import { RESEARCH_DOMAINS, publicationMatchesDomain } from '@/lib/researchDomains';
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
  allPublications: Publication[];
  activeDomainId: string | null;
  onFilterByDomain: (domainId: string) => void;
  onFilterByKeyword: (keyword: string) => void;
};

function HeroStatsResearchSectionComponent({
  heroText,
  statsText,
  researchText,
  lang,
  totalPubs,
  totalCitations,
  hIndexValue,
  allPublications,
  activeDomainId,
  onFilterByDomain,
  onFilterByKeyword,
}: HeroStatsResearchSectionProps) {
  useRenderProfiler('HeroStatsResearchSection');
  const reduceMotion = useReducedMotion();
  const [isImgError, setIsImgError] = useState(false);
  const [hoveredResearchIdx, setHoveredResearchIdx] = useState<number | null>(null);
  const [expandedResearchIdx, setExpandedResearchIdx] = useState<number | null>(null);
  const onImgError = useCallback(() => setIsImgError(true), []);
  const displayHIndex = hIndexValue ?? statsText.hIndexValue;

  // 裝裱肖像內層微視差景深（-10px -> +14px）
  const portraitFrameRef = useRef<HTMLElement>(null);
  const { scrollYProgress: portraitProgress } = useScroll({
    target: portraitFrameRef,
    offset: ['start end', 'end start'],
  });
  const portraitParallaxY = useTransform(portraitProgress, [0, 1], [-10, 14]);

  // 預計算 01–05 各研究領域的對應論文篇數
  const domainCounts = useMemo(() => {
    return RESEARCH_DOMAINS.map((domain) =>
      allPublications.reduce(
        (acc, pub) => acc + (publicationMatchesDomain(pub, domain) ? 1 : 0),
        0,
      ),
    );
  }, [allPublications]);

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
                className="mb-4 text-sm text-[var(--app-muted)]"
              >
                {institutionLine}
              </motion.p>

              <h1 className="font-editorial mb-6 text-[var(--app-ink)]">
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
                  innerClassName="text-2xl font-medium leading-[1.25] tracking-[-0.015em] text-[var(--app-body)] sm:text-3xl lg:text-[2.1rem]"
                >
                  {heroLabHeadline}
                </MaskedTextReveal>
              </h1>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.56, delay: 0.26, ease: EDITORIAL_EASE }}
                className="mb-8 max-w-xl text-[15px] leading-[1.8] text-[var(--app-body)] md:text-base"
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

            {/* 三大統計數據：上下 1px 鋼筆尺規繪線夾住 + 0.85s tabular-nums 滾動跳表 */}
            <div className="mt-12">
              <InkRule dark immediate delay={0} />
              <div className="grid grid-cols-3 divide-x divide-[var(--app-rule)] py-6">
                {[
                  { label: statsText.pubs, value: totalPubs },
                  { label: statsText.citations, value: totalCitations },
                  { label: statsText.hIndex, value: displayHIndex },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={i > 0 ? 'pl-4 sm:pl-6' : 'pr-4'}
                  >
                    <div className="font-editorial text-3xl font-semibold tracking-tight text-[var(--app-ink)] sm:text-4xl">
                      <RollingNumber
                        value={stat.value}
                        delay={0.25 + i * 0.06}
                        duration={0.85}
                      />
                    </div>
                    <div className="mt-1 text-xs text-[var(--app-muted)]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <InkRule dark immediate delay={0.08} />
            </div>
            <p className="mt-3 text-xs text-[var(--app-muted)]">{statsText.scopusNote}</p>
          </div>

          {/* 右欄：直角裝裱肖像框（黑版外框轉深炭灰 #1A1A17，內襯維持暖銀鹽相紙 #DDD9CE 保護 mix-blend-multiply 人像不變黑） */}
          <div className="md:col-span-5">
            <motion.figure
              ref={portraitFrameRef}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.74, delay: 0.18, ease: EDITORIAL_EASE }}
              className="group/portrait mx-auto w-full max-w-[380px] border border-[var(--app-ink)] bg-[var(--app-surface-card)] p-2.5 md:ml-auto md:mr-0"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--portrait-mat)]">
                {isImgError ? (
                  <div className="font-editorial flex h-full w-full items-center justify-center text-3xl font-semibold tracking-widest text-[var(--app-muted)]">
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
              <figcaption className="mt-2.5 border-t border-[var(--app-rule)] pt-2.5 text-xs text-[var(--app-muted)]">
                <span className="font-semibold text-[var(--app-ink)]">{portraitName}</span>
                <span className="mx-1.5">·</span>
                <span>{portraitAffiliation}</span>
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </section>

      {/* 五大研究領域：01.–05. 電致變色橫掃 + 銅版物理圖騰 + 點擊手風琴展開關鍵詞與論文連動篩選 */}
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
            <p className="max-w-sm text-sm text-[var(--app-muted)] md:text-right">
              {researchText.desc}
              <span className="mt-1 block text-xs text-[var(--app-muted)]/85">
                {isZh
                  ? '點擊任一研究領域展開材料關鍵詞並篩選相關著作'
                  : 'Click any area to explore keywords and filter related works'}
              </span>
            </p>
          </div>
        </div>
        <InkRule thick />

        <ol className="divide-y divide-[var(--app-rule)]">
          {researchText.items.map((item, i) => {
            const num = `${String(i + 1).padStart(2, '0')}.`;
            const domain = RESEARCH_DOMAINS[i];
            const domainCount = domainCounts[i] ?? 0;
            const isExpanded = expandedResearchIdx === i;
            const isActiveDomain = Boolean(domain && activeDomainId === domain.id);
            const isGlyphActive = hoveredResearchIdx === i || isExpanded || isActiveDomain;

            return (
              <li
                key={item.title}
                onMouseEnter={() => setHoveredResearchIdx(i)}
                onMouseLeave={() => setHoveredResearchIdx((prev) => (prev === i ? null : prev))}
                className="group relative overflow-hidden"
              >
                {/* 電致變色薄膜橫掃底襯（懸停或展開時呈現） */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 origin-left bg-[var(--app-hover)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isExpanded || isActiveDomain
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100'
                  }`}
                />
                {/* 左側極細強調指示邊線 */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-0 left-0 top-0 w-[2.5px] origin-top bg-[var(--app-accent)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    isExpanded || isActiveDomain
                      ? 'scale-y-100'
                      : 'scale-y-0 group-hover:scale-y-100 group-focus-within:scale-y-100'
                  }`}
                />

                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`research-drawer-${i}`}
                  onClick={() => setExpandedResearchIdx((prev) => (prev === i ? null : i))}
                  className="relative z-10 w-full cursor-pointer px-3 py-6 text-left focus:outline-none md:px-4"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center md:gap-6">
                    <div className="flex items-center justify-between md:col-span-1 md:block">
                      <span
                        className={`font-editorial inline-block text-lg font-medium [font-variant-numeric:tabular-nums] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                          isExpanded || isActiveDomain
                            ? 'translate-x-1.5 text-[var(--app-accent)]'
                            : 'text-[var(--app-ink)] group-hover:translate-x-1.5 group-hover:text-[var(--app-accent)]'
                        }`}
                      >
                        {num}
                      </span>
                      <div className="flex items-center gap-3 md:hidden">
                        <ResearchPhysicsGlyph index={i} isActive={isGlyphActive} />
                        <ChevronDown
                          className={`h-4 w-4 text-[var(--app-muted)] transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-[var(--app-accent)]' : ''
                          }`}
                          aria-hidden
                        />
                      </div>
                    </div>

                    <h3
                      className={`font-editorial text-xl font-semibold transition-colors duration-300 md:col-span-3 ${
                        isExpanded || isActiveDomain
                          ? 'text-[var(--app-accent)]'
                          : 'text-[var(--app-ink)] group-hover:text-[var(--app-accent)]'
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p className="text-sm leading-[1.75] text-[var(--app-body)] md:col-span-6">
                      {item.desc}
                    </p>

                    <div className="hidden items-center justify-end gap-3 md:col-span-2 md:flex">
                      <ResearchPhysicsGlyph index={i} isActive={isGlyphActive} />
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[var(--app-muted)] transition-transform duration-300 ${
                          isExpanded
                            ? 'rotate-180 text-[var(--app-accent)]'
                            : 'group-hover:text-[var(--app-ink)]'
                        }`}
                        aria-hidden
                      />
                    </div>
                  </div>
                </button>

                {/* 可展開手風琴抽屜：核心材料關鍵字標籤 + 一鍵捲動過濾論文 */}
                <AnimatePresence initial={false}>
                  {isExpanded && domain ? (
                    <motion.div
                      id={`research-drawer-${i}`}
                      key={`drawer-${domain.id}`}
                      initial={reduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.34, ease: EDITORIAL_EASE }}
                      className="relative z-10 overflow-hidden"
                    >
                      <div className="border-t border-[var(--app-rule)] px-3 pb-6 pt-4 md:grid md:grid-cols-12 md:items-center md:gap-6 md:px-4">
                        <div className="hidden md:col-span-1 md:block" />
                        <div className="flex flex-wrap items-center gap-2 md:col-span-7">
                          <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-[var(--app-muted)]">
                            {isZh ? '核心關鍵詞' : 'Keywords'}
                          </span>
                          {domain.keywords.map((kw) => (
                            <button
                              key={kw.label}
                              type="button"
                              onClick={() => onFilterByKeyword(kw.query)}
                              className="border border-[var(--app-rule)] bg-[var(--app-bg)] px-2.5 py-1 font-mono text-xs text-[var(--app-body)] transition-colors hover:border-[var(--app-accent)] hover:text-[var(--app-accent)]"
                            >
                              {kw.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 flex md:col-span-4 md:mt-0 md:justify-end">
                          <button
                            type="button"
                            onClick={() => onFilterByDomain(domain.id)}
                            className={`${uiTokens.buttonPrimary} inline-flex items-center gap-2 px-4 py-2 text-xs`}
                          >
                            <span>
                              {isZh
                                ? `篩選此領域相關論文${domainCount > 0 ? `（${domainCount} 篇）` : ''}`
                                : `Filter related works${domainCount > 0 ? ` (${domainCount})` : ''}`}
                            </span>
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
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
