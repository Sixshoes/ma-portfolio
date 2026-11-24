'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import type { Publication } from '@/lib/publications';
import { EDITORIAL_EASE } from '@/app/components/EditorialMotion';

type YearBucket = {
  year: number;
  count: number;
  starredCount: number;
  citations: number;
};

type PublicationTimelineChartProps = {
  publications: Publication[];
  selectedFilter: string;
  lang: 'en' | 'zh';
  onSelectYear: (yearOrAll: string) => void;
};

/** 溫潤圓角學報時間軸長條圖卡片（18ms 波浪生長、流體切換與懸停精準標記） */
function PublicationTimelineChartComponent({
  publications,
  selectedFilter,
  lang,
  onSelectYear,
}: PublicationTimelineChartProps) {
  const [metric, setMetric] = useState<'papers' | 'citations'>('papers');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [waveFinished, setWaveFinished] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(chartRef, { once: true, margin: '-60px' });
  const reduceMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();

  const { buckets, minYear, maxYear, peakBucket, totalStarred, maxMetricValue, hasInPress } =
    useMemo(() => {
      const valid = publications.filter(
        (p) => Number.isFinite(p.year) && p.year >= 1900 && p.year <= 2100,
      );
      if (valid.length === 0) {
        return {
          buckets: [] as YearBucket[],
          minYear: 0,
          maxYear: 0,
          peakBucket: null as YearBucket | null,
          totalStarred: 0,
          maxMetricValue: 1,
          hasInPress: false,
        };
      }

      const byYear = new Map<number, YearBucket>();
      let min = Infinity;
      let max = -Infinity;
      let starred = 0;

      for (const p of valid) {
        if (p.year < min) min = p.year;
        if (p.year > max) max = p.year;
        if (p.is_star === '是') starred += 1;

        const existing = byYear.get(p.year);
        if (existing) {
          existing.count += 1;
          if (p.is_star === '是') existing.starredCount += 1;
          existing.citations += p.citations;
        } else {
          byYear.set(p.year, {
            year: p.year,
            count: 1,
            starredCount: p.is_star === '是' ? 1 : 0,
            citations: p.citations,
          });
        }
      }

      const fullBuckets: YearBucket[] = [];
      for (let y = min; y <= max; y += 1) {
        fullBuckets.push(
          byYear.get(y) ?? { year: y, count: 0, starredCount: 0, citations: 0 },
        );
      }

      let peak: YearBucket | null = null;
      let maxVal = 1;
      for (const b of fullBuckets) {
        if (!peak || b.count > peak.count) peak = b;
        const v = metric === 'papers' ? b.count : b.citations;
        if (v > maxVal) maxVal = v;
      }

      return {
        buckets: fullBuckets,
        minYear: min,
        maxYear: max,
        peakBucket: peak,
        totalStarred: starred,
        maxMetricValue: maxVal,
        hasInPress: max > currentYear,
      };
    }, [publications, metric, currentYear]);

  useEffect(() => {
    if (!isInView || waveFinished) return;
    if (reduceMotion) {
      setWaveFinished(true);
      return;
    }
    const totalWaveMs = buckets.length * 18 + 560;
    const timer = window.setTimeout(() => setWaveFinished(true), totalWaveMs);
    return () => window.clearTimeout(timer);
  }, [isInView, waveFinished, reduceMotion, buckets.length]);

  // 手機窄螢幕可橫向捲動時，預設捲至最右側優先呈現近年高產高峰（2011–2027）
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollWidth > el.clientWidth + 4) {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    }
  }, [buckets.length]);

  if (buckets.length < 2) return null;

  const activeYearNum = /^\d{4}$/.test(selectedFilter) ? Number(selectedFilter) : null;
  const inspectedYear = hoveredYear ?? activeYearNum;
  const inspectedBucket = inspectedYear
    ? buckets.find((b) => b.year === inspectedYear) ?? null
    : null;

  const hoveredIndex =
    hoveredYear !== null ? buckets.findIndex((b) => b.year === hoveredYear) : -1;
  const hoveredBucket = hoveredIndex >= 0 ? buckets[hoveredIndex] : null;
  const hoveredPct =
    hoveredIndex >= 0 && buckets.length > 0
      ? Math.min(90, Math.max(10, ((hoveredIndex + 0.5) / buckets.length) * 100))
      : 50;

  const isZh = lang === 'zh';
  const inPressLabel = isZh ? '預刊' : 'In Press';

  return (
    <div ref={chartRef} className="atlas-card flex h-full flex-col justify-between p-5 sm:p-6">
      <div>
        {/* 頂部標題與單行圓角膠囊切換（鎖定按鈕不換行，寬度不足時整組自然折行） */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-editorial text-xl font-semibold text-[var(--app-ink)]">
              {isZh
                ? `歷年發表與引用軌跡（${minYear}–${maxYear}）`
                : `Publication & Citation Trajectory (${minYear}–${maxYear})`}
            </h3>
            {hasInPress ? (
              <span className="shrink-0 whitespace-nowrap rounded-full border border-[var(--app-accent)]/50 bg-[var(--app-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--app-accent)]">
                {isZh ? `含 ${maxYear} 預刊` : `incl. ${maxYear} In Press`}
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {activeYearNum ? (
              <button
                type="button"
                onClick={() => onSelectYear('All')}
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-[var(--app-ink)] px-3.5 py-1.5 text-[13.5px] text-[var(--app-bg)] transition-colors hover:bg-[var(--app-accent)]"
              >
                {isZh
                  ? `${activeYearNum} 年${activeYearNum > currentYear ? '（預刊）' : ''}`
                  : `${activeYearNum}${activeYearNum > currentYear ? ' (In Press)' : ''}`}
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}

            <div
              role="group"
              aria-label={isZh ? '圖表指標切換' : 'Timeline metric toggle'}
              className="inline-flex shrink-0 rounded-full border border-[var(--app-rule)] bg-[var(--app-bg)] p-0.5 text-[13.5px]"
            >
              {(['papers', 'citations'] as const).map((mode) => {
                const active = metric === mode;
                const label =
                  mode === 'papers'
                    ? isZh
                      ? '發表篇數'
                      : 'Papers'
                    : isZh
                      ? '年度引用'
                      : 'Citations';
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setWaveFinished(true);
                      setMetric(mode);
                    }}
                    aria-pressed={active}
                    className={`relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${
                      active
                        ? 'font-semibold text-[var(--app-bg)]'
                        : 'text-[var(--app-muted)] hover:text-[var(--app-ink)]'
                    }`}
                  >
                    {active ? (
                      <motion.span
                        layoutId={reduceMotion ? undefined : 'timeline-metric-pill'}
                        transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
                        className="absolute inset-0 rounded-full bg-[var(--app-ink)]"
                      />
                    ) : null}
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 柔和數據讀數條 */}
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[var(--app-bg)]/70 px-4 py-3 text-sm"
          aria-live="polite"
        >
          {inspectedBucket ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--app-body)]">
              <span className="inline-flex items-center gap-1.5 font-mono text-base font-semibold text-[var(--app-ink)]">
                {inspectedBucket.year}
                {inspectedBucket.year > currentYear ? (
                  <span className="rounded-full bg-[var(--app-accent)]/15 px-2 py-0.5 font-sans text-xs font-medium text-[var(--app-accent)]">
                    {inPressLabel}
                  </span>
                ) : null}
              </span>
              <span>
                {isZh ? '發表 ' : 'Papers '}
                <strong className="font-mono text-[var(--app-ink)]">{inspectedBucket.count}</strong>
              </span>
              <span>
                {isZh ? '通訊 ' : 'Corr. '}
                <strong className="font-mono text-[var(--app-accent)]">
                  {inspectedBucket.starredCount}
                </strong>
              </span>
              <span>
                {isZh ? '引用 ' : 'Cit. '}
                <strong className="font-mono text-[var(--app-ink)]">
                  {inspectedBucket.citations.toLocaleString('en-US')}
                </strong>
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--app-muted)]">
              {peakBucket ? (
                <span>
                  {isZh ? '最高產年度：' : 'Peak: '}
                  <strong className="font-mono text-[var(--app-ink)]">{peakBucket.year}</strong> (
                  {peakBucket.count} {isZh ? '篇' : 'pubs'})
                </span>
              ) : null}
              <span>
                {isZh ? '通訊作者：' : 'Corresponding: '}
                <strong className="font-mono text-[var(--app-accent)]">{totalStarred}</strong>{' '}
                {isZh ? '篇' : 'works'}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--app-muted)]">
            {metric === 'papers' ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--app-accent)]" aria-hidden />
                  {isZh ? '通訊作者' : 'Corresponding'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-[var(--app-bar-coauthor)]"
                    aria-hidden
                  />
                  {isZh ? '共同作者' : 'Co-author'}
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--app-accent)]" aria-hidden />
                {isZh ? '年度累計引用' : 'Citations / yr'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 長條圖本體（左側 Y 軸與長條畫布鎖定相同固定高度 h-52 / lg:h-[310px]，確保 0 刻度精準貼齊底線、絕不掉到年份下方） */}
      <div className="mt-1 flex items-start gap-2 pt-1">
        {/* 固定左側 Y 軸刻度：與右側長條區共用完全相同的 pt-8 與繪圖區高度 */}
        <div aria-hidden="true" className="w-10 shrink-0 pt-8">
          <div className="flex h-52 flex-col justify-between text-right font-mono text-[11.5px] text-[var(--app-muted)] [font-variant-numeric:tabular-nums] lg:h-[310px]">
            {[1, 0.5, 0].map((ratio, idx) => (
              <span key={idx} className="leading-none">
                {Math.round(maxMetricValue * ratio).toLocaleString('en-US')}
              </span>
            ))}
          </div>
        </div>

        {/* 右側可捲動柱狀繪圖區 */}
        <div ref={scrollContainerRef} className="min-w-0 flex-1 overflow-x-auto pb-1">
          <div className="relative min-w-[520px] pr-4 pt-8 lg:min-w-0">
            <div className="pointer-events-none absolute left-0 right-4 top-0 h-7">
              <AnimatePresence>
                {hoveredBucket && hoveredBucket.count > 0 ? (
                  <motion.div
                    key="timeline-floating-marker"
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      left: `${hoveredPct}%`,
                    }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
                    style={{ transform: 'translateX(-50%)' }}
                    className="absolute top-0 whitespace-nowrap rounded-full border border-[var(--app-ink)] bg-[var(--app-surface-card)] px-3 py-0.5 font-mono text-xs text-[var(--app-ink)] shadow-sm [font-variant-numeric:tabular-nums]"
                  >
                    <span className="font-semibold">{hoveredBucket.year}</span>
                    <span className="mx-1.5 text-[var(--app-muted)]">·</span>
                    <span className="text-[var(--app-accent)]">
                      {metric === 'papers'
                        ? `${hoveredBucket.count} ${isZh ? '篇' : 'pubs'}`
                        : `${hoveredBucket.citations.toLocaleString('en-US')} ${isZh ? '引' : 'cit.'}`}
                    </span>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* 柱狀畫布區（虛線格線與長條共享 100% 相同起點與 0 基準底線） */}
            <div className="relative h-52 lg:h-[310px]">
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {[1, 0.5, 0].map((_, idx) => (
                  <div key={idx} className="h-px w-full border-b border-dashed border-[var(--app-rule)]" />
                ))}
              </div>

              <div
                className="relative z-10 flex h-full items-end gap-[2.5px] sm:gap-[3px]"
                onMouseLeave={() => setHoveredYear(null)}
              >
                {buckets.map((b, idx) => {
                  const value = metric === 'papers' ? b.count : b.citations;
                  const heightPct = value > 0 ? Math.max(6, (value / maxMetricValue) * 100) : 0;
                  const starredRatio = b.count > 0 ? (b.starredCount / b.count) * 100 : 0;
                  const isSelected = activeYearNum === b.year;
                  const isHovered = hoveredYear === b.year;
                  const isEmpty = b.count === 0;
                  const isFutureYear = b.year > currentYear;

                  const targetHeight = isInView || reduceMotion ? `${heightPct}%` : '0%';
                  const barTransition = reduceMotion
                    ? { duration: 0 }
                    : waveFinished
                      ? { duration: 0.46, delay: 0, ease: EDITORIAL_EASE }
                      : { duration: 0.52, delay: idx * 0.018, ease: EDITORIAL_EASE };

                  return (
                    <div key={b.year} className="flex h-full min-w-0 flex-1 items-end">
                      <button
                        type="button"
                        disabled={isEmpty}
                        onMouseEnter={() => setHoveredYear(b.year)}
                        onFocus={() => setHoveredYear(b.year)}
                        onBlur={() => setHoveredYear(null)}
                        onClick={() => onSelectYear(isSelected ? 'All' : String(b.year))}
                        aria-label={
                          isZh
                            ? `${b.year} 年${isFutureYear ? '（預刊）' : ''}：${b.count} 篇論文，${b.citations} 次引用`
                            : `${b.year}${isFutureYear ? ' (In Press)' : ''}: ${b.count} papers, ${b.citations} citations`
                        }
                        aria-pressed={isSelected}
                        className={`group flex h-full w-full items-end justify-center pt-1 focus:outline-none ${
                          isEmpty ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        {isEmpty ? (
                          <span className="h-px w-full bg-[var(--app-rule)]" />
                        ) : isFutureYear ? (
                          <motion.span
                            initial={reduceMotion ? false : { height: '0%' }}
                            animate={{ height: targetHeight }}
                            transition={barTransition}
                            className={`block w-full rounded-t-[4px] border border-dashed border-[var(--app-accent)] transition-colors duration-150 ${
                              isSelected
                                ? 'bg-[var(--app-accent)]/35'
                                : isHovered
                                  ? 'bg-[var(--app-accent)]/20'
                                  : 'bg-[var(--app-hover)]'
                            }`}
                          />
                        ) : metric === 'papers' ? (
                          <motion.span
                            initial={reduceMotion ? false : { height: '0%' }}
                            animate={{ height: targetHeight }}
                            transition={barTransition}
                            className={`relative flex w-full flex-col justify-end overflow-hidden rounded-t-[4px] transition-colors duration-150 ${
                              isSelected
                                ? 'bg-[var(--app-bar-coauthor-hover)] ring-1 ring-[var(--app-ink)]'
                                : isHovered
                                  ? 'bg-[var(--app-bar-coauthor-hover)]'
                                  : 'bg-[var(--app-bar-coauthor)]'
                            }`}
                          >
                            {b.starredCount > 0 ? (
                              <motion.span
                                animate={{ height: `${starredRatio}%` }}
                                transition={
                                  reduceMotion
                                    ? { duration: 0 }
                                    : { duration: 0.42, ease: EDITORIAL_EASE }
                                }
                                className={`block w-full transition-colors duration-150 ${
                                  isSelected
                                    ? 'bg-[var(--app-ink)]'
                                    : 'bg-[var(--app-accent)] group-hover:bg-[var(--app-ink)]'
                                }`}
                              />
                            ) : null}
                          </motion.span>
                        ) : (
                          <motion.span
                            initial={reduceMotion ? false : { height: '0%' }}
                            animate={{ height: targetHeight }}
                            transition={barTransition}
                            className={`block w-full rounded-t-[4px] transition-colors duration-150 ${
                              isSelected || isHovered
                                ? 'bg-[var(--app-ink)]'
                                : 'bg-[var(--app-accent)]'
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 獨立於 0 基線下方的 X 軸年份標籤列 */}
            <div className="mt-2 flex h-5 items-center gap-[2.5px] sm:gap-[3px]">
              {buckets.map((b, idx) => {
                const isSelected = activeYearNum === b.year;
                const isFutureYear = b.year > currentYear;
                const showLabel =
                  idx === 0 || idx === buckets.length - 1 || b.year % 5 === 0 || isSelected;
                return (
                  <span
                    key={b.year}
                    className={`min-w-0 flex-1 text-center font-mono text-[11px] leading-none [font-variant-numeric:tabular-nums] ${
                      isSelected
                        ? 'font-bold text-[var(--app-ink)]'
                        : showLabel
                          ? isFutureYear
                            ? 'font-medium text-[var(--app-accent)]'
                            : 'text-[var(--app-muted)]'
                          : 'select-none text-transparent'
                    }`}
                  >
                    {showLabel ? b.year : '·'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const PublicationTimelineChart = memo(PublicationTimelineChartComponent);
