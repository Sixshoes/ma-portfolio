'use client';

import React, { memo, useCallback, useState } from 'react';
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
  const [isImgError, setIsImgError] = useState(false);
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
          {/* 左欄：全墨黑正體書卷襯線排版（零破折號小標、零局部塗藍、零假斜體） */}
          <div className="flex flex-col justify-between md:col-span-7">
            <div>
              <p className="mb-4 text-sm text-[#5C5953]">
                {institutionLine}
              </p>

              <h1 className="font-editorial mb-6 text-[#141413]">
                <span className="block text-4xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-5xl lg:text-[3.35rem]">
                  {heroPrimaryName}
                </span>
                <span className="mt-2 block text-2xl font-medium leading-[1.25] tracking-[-0.015em] text-[#2D2C29] sm:text-3xl lg:text-[2.1rem]">
                  {heroLabHeadline}
                </span>
              </h1>

              <p className="mb-8 max-w-xl text-[15px] leading-[1.8] text-[#2D2C29] md:text-base">
                {heroText.desc}
              </p>

              <div className="flex flex-wrap items-center gap-3.5">
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
              </div>
            </div>

            {/* 三大統計數據：上下 1px 墨黑尺規夾住，全部統一墨黑書卷襯線大字 */}
            <div className="mt-12 border-y border-[#141413] py-6">
              <div className="grid grid-cols-3 divide-x divide-[#D4D1C8]">
                {[
                  { label: statsText.pubs, value: formatStatValue(totalPubs) },
                  { label: statsText.citations, value: formatStatValue(totalCitations) },
                  { label: statsText.hIndex, value: formatStatValue(displayHIndex) },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={i > 0 ? 'pl-4 sm:pl-6' : 'pr-4'}
                  >
                    <div className="font-editorial text-3xl font-semibold tracking-tight text-[#141413] [font-variant-numeric:tabular-nums] sm:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs text-[#5C5953]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-xs text-[#5C5953]">{statsText.scopusNote}</p>
          </div>

          {/* 右欄：直角裝裱霧暖礦石灰肖像框（mix-blend-multiply 自然消融白底 JPG） */}
          <div className="md:col-span-5">
            <figure className="mx-auto w-full max-w-[380px] border border-[#141413] bg-[#F7F6F2] p-2.5 md:ml-auto md:mr-0">
              <div className="aspect-[4/5] w-full overflow-hidden bg-[#E6E4DD]">
                {isImgError ? (
                  <div className="font-editorial flex h-full w-full items-center justify-center text-3xl font-semibold tracking-widest text-[#5C5953]">
                    YRM
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/profile.jpg"
                    alt={portraitAlt}
                    fetchPriority="high"
                    onError={onImgError}
                    className="h-full w-full object-cover object-top mix-blend-multiply contrast-[1.03]"
                  />
                )}
              </div>
              <figcaption className="mt-2.5 border-t border-[#D4D1C8] pt-2.5 text-xs text-[#4A4843]">
                <span className="font-semibold text-[#141413]">{portraitName}</span>
                <span className="mx-1.5">·</span>
                <span>{portraitAffiliation}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 五大研究領域：01.–05. 全寬水平尺規列表（拆除所有圓角卡片與裝飾 Icon） */}
      <section
        id="research"
        className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:py-24"
      >
        <div
          className={`flex flex-col items-start justify-between gap-3 md:flex-row md:items-end ${uiTokens.sectionHeaderRule}`}
        >
          <h2 className={uiTokens.sectionTitle}>
            {researchText.title}
            {lang === 'en' ? ' ' : ''}
            {researchText.subtitle}
          </h2>
          <p className="max-w-sm text-sm text-[#5C5953] md:text-right">
            {researchText.desc}
          </p>
        </div>

        <ol className="divide-y divide-[#D4D1C8] border-b border-[#141413]">
          {researchText.items.map((item, i) => {
            const num = `${String(i + 1).padStart(2, '0')}.`;
            return (
              <li
                key={item.title}
                className="grid grid-cols-1 gap-2 px-2 py-6 transition-colors duration-150 hover:bg-[#EFECE6] md:grid-cols-12 md:items-baseline md:gap-6"
              >
                <span className="font-editorial text-lg font-medium text-[#141413] [font-variant-numeric:tabular-nums] md:col-span-1">
                  {num}
                </span>
                <h3 className="font-editorial text-xl font-semibold text-[#141413] md:col-span-4">
                  {item.title}
                </h3>
                <p className="text-sm leading-[1.75] text-[#2D2C29] md:col-span-7">
                  {item.desc}
                </p>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
