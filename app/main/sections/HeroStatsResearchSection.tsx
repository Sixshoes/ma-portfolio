'use client';

import React, { memo, useCallback, useState } from 'react';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
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

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;

function formatStatValue(val: number | string): string {
  return typeof val === 'number' ? val.toLocaleString('en-US') : val;
}

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
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isImgError, setIsImgError] = useState(false);
  const onImgLoaded = useCallback(() => setIsImgLoaded(true), []);
  const onImgError = useCallback(() => setIsImgError(true), []);
  const displayHIndex = hIndexValue ?? statsText.hIndexValue;

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

  const secondaryCtaLabel = lang === 'zh' ? '學術歷程' : 'Academic Journey';
  const portraitName = lang === 'zh' ? '馬遠榮 副校長' : 'Prof. Yuan-Ron Ma';
  const portraitAffiliation =
    lang === 'zh'
      ? '佛光大學講座教授 · 國立東華大學特聘教授'
      : 'Fo Guang University · National Dong Hwa University';
  const researchKicker = lang === 'zh' ? '研究主軸' : 'RESEARCH DOMAINS';

  return (
    <>
      <section
        id="top"
        className="mx-auto max-w-7xl px-6 pb-16 pt-24 md:pb-24 md:pt-32"
      >
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12 md:items-center md:gap-10 lg:gap-14">
          {/* 左側：純粹字體排印與動態實績橫條（零斜體裁切、零假斜體） */}
          <div className="flex flex-col justify-between md:col-span-7">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-[2px] w-7 bg-[#0F4C81]" aria-hidden />
                <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#0F4C81]">
                  {heroText.role}
                </span>
              </div>

              <h1 className="mb-6 text-4xl font-semibold leading-[1.12] tracking-[-0.03em] text-[#11161C] sm:text-5xl lg:text-[3.5rem]">
                <span className="text-[#0F4C81]">{heroText.title1}</span>
                {lang === 'en' ? ' ' : null}
                <span>{heroText.title2}</span>
                {heroText.title3 ? (
                  <>
                    <br />
                    <span className="font-medium text-[#2B3642]">{heroText.title3}</span>{' '}
                    <span className="font-medium text-[#2B3642]">{heroText.title4}</span>
                  </>
                ) : (
                  <>
                    <br />
                    <span className="font-medium text-[#2B3642]">{heroText.title4}</span>
                  </>
                )}
              </h1>

              <p className="mb-8 max-w-xl text-base leading-[1.75] text-[#475569] md:text-[1.05rem]">
                {heroText.desc}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#publications"
                  onClick={(e) => scrollToSection(e, 'publications')}
                  className={`${uiTokens.buttonPrimaryStrong} inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em]`}
                >
                  {heroText.cta}
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href="#about"
                  onClick={(e) => scrollToSection(e, 'about')}
                  className={`${uiTokens.buttonGhost} inline-flex items-center rounded-md px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em]`}
                >
                  {secondaryCtaLabel}
                </a>
              </div>
            </div>

            {/* 首屏動態數據橫條 */}
            <div className="mt-10 border-t border-[#DCE2E8] pt-7">
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                {[
                  { label: statsText.pubs, value: formatStatValue(totalPubs), accent: false },
                  { label: statsText.citations, value: formatStatValue(totalCitations), accent: false },
                  { label: statsText.hIndex, value: formatStatValue(displayHIndex), accent: true },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={i > 0 ? 'border-l border-[#DCE2E8] pl-4 sm:pl-6' : ''}
                  >
                    <div
                      className={`font-mono text-2xl font-semibold tracking-tight [font-variant-numeric:tabular-nums] sm:text-3xl md:text-[2.1rem] ${
                        stat.accent ? 'text-[#0F4C81]' : 'text-[#11161C]'
                      }`}
                    >
                      {stat.value}
                    </div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#5A6775]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 font-mono text-[11px] text-[#64748B]">{statsText.scopusNote}</p>
            </div>
          </div>

          {/* 右側：乾淨個人肖像卡（移除重黑漸層遮罩，保留單純 1px 瑞士細框與獨立署名列） */}
          <div className="md:col-span-5">
            <figure className="mx-auto w-full max-w-[380px] overflow-hidden rounded-lg border border-[#DCE2E8] bg-white md:ml-auto md:mr-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EEF1F5]">
                {isImgError ? (
                  <div className="flex h-full w-full items-center justify-center font-mono text-3xl font-semibold tracking-widest text-[#0F4C81]/70">
                    YRM
                  </div>
                ) : (
                  <Image
                    src="/profile.jpg"
                    alt="馬遠榮副校長個人照 (Prof. Y.R. Ma)"
                    fill
                    priority
                    sizes="(max-width: 768px) 92vw, 380px"
                    onLoad={onImgLoaded}
                    onError={onImgError}
                    className={`object-cover object-top transition-opacity duration-300 ${
                      isImgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
              </div>
              <figcaption className="border-t border-[#DCE2E8] bg-white px-5 py-4">
                <div className="text-base font-semibold tracking-tight text-[#11161C]">
                  {portraitName}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-[#5A6775]">
                  {portraitAffiliation}
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 五大研究領域：純粹字體排印、羅馬數字與 1px 瑞士格線（零空白圖框、零光暈動畫） */}
      <section
        id="research"
        className="mx-auto max-w-7xl scroll-mt-20 border-t border-[#DCE2E8] px-6 py-20 md:py-24"
      >
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div>
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="h-[2px] w-5 bg-[#0F4C81]" aria-hidden />
              <span className={uiTokens.sectionKicker}>{researchKicker}</span>
            </div>
            <h2 className={uiTokens.sectionTitle}>
              {researchText.title}
              {lang === 'en' ? ' ' : ''}
              {researchText.subtitle}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-[#5A6775] md:text-right">
            {researchText.desc}
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#DCE2E8]">
          <div className="grid grid-cols-1 gap-px md:grid-cols-2 lg:grid-cols-6">
            {researchText.items.map((item, i) => {
              const roman = ROMAN_NUMERALS[i] ?? String(i + 1);
              const Icon = item.icon;
              const spanClass =
                researchText.items.length === 5
                  ? i < 3
                    ? 'lg:col-span-2'
                    : i === 4
                      ? 'md:col-span-2 lg:col-span-3'
                      : 'lg:col-span-3'
                  : 'lg:col-span-2';
              return (
                <div
                  key={item.title}
                  className={`${spanClass} group relative bg-white p-7 transition-colors duration-150 hover:bg-[#FAFBFC] md:p-8`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#0F4C81] transition-transform duration-150 group-hover:scale-x-100"
                  />
                  <div className="flex h-full flex-col">
                    <div className="mb-6 flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold tracking-wider text-[#0F4C81]">
                        {roman}
                      </span>
                      <Icon className="h-5 w-5 stroke-[1.5] text-[#64748B] transition-colors duration-150 group-hover:text-[#0F4C81]" />
                    </div>
                    <h3 className="mb-2.5 text-lg font-semibold tracking-tight text-[#11161C] transition-colors duration-150 group-hover:text-[#0F4C81]">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#475569]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
