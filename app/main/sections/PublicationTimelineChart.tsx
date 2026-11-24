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

/** 無框學報時間軸長條圖（支援晝夜雙版 CSS 變數、18ms 波浪生長、流體切換與懸停精準標記） */
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
      ? Math.min(92, Math.max(8, ((hoveredIndex + 0.5) / buckets.length) * 100))
      : 50;

  const isZh = lang === 'zh';
  const inPressLabel = isZh ? '預刊' : 'In Press';

  return (
    <div ref={chartRef} className="py-8">
      {/* 頂部無框標題與底線指標切換 */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h3 className="font-editorial text-lg font-semibold text-[var(--app-ink)]">
              {isZh
                ? `歷年發表與引用分佈（${minYear}–${maxYear}）`
                : `Annual Publication & Citation Record (${minYear}–${maxYear})`}
            </h3>
            {hasInPress ? (
              <span className="border border-[var(--app-accent)] px-1.5 py-0.5 text-[11px] text-[var(--app-accent)]">
                {isZh ? `含 ${maxYear} 預刊` : `incl. ${maxYear} In Press`}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[var(--app-muted)]">
            {isZh
              ? '點擊任一年份柱狀即可篩選該年度著作；再次點擊取消'
              : 'Click any year bar to filter works; click again to clear'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {activeYearNum ? (
            <button
              type="button"
              onClick={() => onSelectYear('All')}
              className="inline-flex items-center gap-1 border border-[var(--app-ink)] bg-[var(--app-ink)] px-2.5 py-1 text-xs text-[var(--app-bg)] transition-colors hover:border-[var(--app-accent)] hover:bg-[var(--app-accent)]"
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
            className="inline-flex items-center gap-5 text-sm"
          >
            {(['papers', 'citations'] as const).map((mode) => {
              const active = metric === mode;
              const label =
                mode === 'papers'
                  ? isZh
                    ? '發表篇數'
                    : 'Papers / yr'
                  : isZh
                    ? '年度引用數'
                    : 'Citations / yr';
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setWaveFinished(true);
                    setMetric(mode);
                  }}
                  aria-pressed={active}
                  className={`relative pb-1.5 transition-colors ${
                    active
                      ? 'font-semibold text-[var(--app-ink)]'
                      : 'text-[var(--app-muted)] hover:text-[var(--app-ink)]'
                  }`}
                >
                  {label}
                  {active ? (
                    <motion.span
                      layoutId={reduceMotion ? undefined : 'timeline-metric-underline'}
                      transition={{ duration: 0.3, ease: EDITORIAL_EASE }}
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--app-ink)]"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 無框細線數據讀數與圖例列 */}
      <div
        className="mb-5 flex flex-wrap items-center justify-between gap-2 border-y border-[var(--app-rule)] py-2.5 text-xs"
        aria-live="polite"
      >
        {inspectedBucket ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[var(--app-body)]">
            <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[var(--app-ink)]">
              {inspectedBucket.year}
              {inspectedBucket.year > currentYear ? (
                <span className="border border-[var(--app-accent)] px-1 py-0.5 font-sans text-[10px] font-medium text-[var(--app-accent)]">
                  {inPressLabel}
                </span>
              ) : null}
            </span>
            <span>
              {isZh ? '發表篇數 ' : 'Papers '}
              <strong className="font-mono text-[var(--app-ink)]">{inspectedBucket.count}</strong>
            </span>
            <span>
              {isZh ? '通訊作者 ' : 'Corresponding '}
              <strong className="font-mono text-[var(--app-accent)]">
                {inspectedBucket.starredCount}
              </strong>
            </span>
            <span>
              {isZh ? '累計引用 ' : 'Citations '}
              <strong className="font-mono text-[var(--app-ink)]">
                {inspectedBucket.citations.toLocaleString('en-US')}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[var(--app-muted)]">
            {peakBucket ? (
              <span>
                {isZh ? '最高產年度：' : 'Peak year: '}
                <strong className="font-mono text-[var(--app-ink)]">{peakBucket.year}</strong> (
                {peakBucket.count} {isZh ? '篇' : 'papers'})
              </span>
            ) : null}
            <span>
              {isZh ? '通訊作者：' : 'Corresponding: '}
              <strong className="font-mono text-[var(--app-accent)]">{totalStarred}</strong>{' '}
              {isZh ? '篇' : 'works'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--app-muted)]">
          {metric === 'papers' ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[var(--app-accent)]" aria-hidden />
                {isZh ? '通訊作者' : 'Corresponding'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[var(--app-bar-coauthor)]" aria-hidden />
                {isZh ? '共同作者' : 'Co-author'}
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-[var(--app-accent)]" aria-hidden />
              {isZh ? '依發表年份統計之累計引用數' : 'Cumulative citations by publication year'}
            </span>
          )}
          {hasInPress ? (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 border border-dashed border-[var(--app-accent)] bg-[var(--app-hover)]"
                aria-hidden
              />
              {inPressLabel}
            </span>
          ) : null}
        </div>
      </div>

      {/* 長條圖本體（直接落於畫布，含懸停平滑跟隨之精準數據標記） */}
      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[620px] pt-8">
          <div className="pointer-events-none absolute left-12 right-0 top-0 h-7">
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
                  className="absolute top-0 whitespace-nowrap border border-[var(--app-ink)] bg-[var(--app-bg)] px-2 py-0.5 font-mono text-[11px] text-[var(--app-ink)] [font-variant-numeric:tabular-nums]"
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

          <div className="pointer-events-none absolute inset-x-0 bottom-7 top-8 flex flex-col justify-between">
            {[1, 0.5, 0].map((ratio, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span className="w-9 shrink-0 text-right font-mono text-[10px] text-[var(--app-muted)] [font-variant-numeric:tabular-nums]">
                  {Math.round(maxMetricValue * ratio).toLocaleString('en-US')}
                </span>
                <div className="h-px flex-1 border-b border-dashed border-[var(--app-rule)]" />
              </div>
            ))}
          </div>

          <div
            className="relative z-10 ml-12 flex h-36 items-end gap-[3px] sm:gap-1"
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
              const showLabel =
                idx === 0 || idx === buckets.length - 1 || b.year % 5 === 0 || isSelected;

              const targetHeight = isInView || reduceMotion ? `${heightPct}%` : '0%';
              const barTransition = reduceMotion
                ? { duration: 0 }
                : waveFinished
                  ? { duration: 0.46, delay: 0, ease: EDITORIAL_EASE }
                  : { duration: 0.52, delay: idx * 0.018, ease: EDITORIAL_EASE };

              return (
                <div key={b.year} className="flex h-full min-w-0 flex-1 flex-col items-center">
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
                        className={`block w-full border border-dashed border-[var(--app-accent)] transition-colors duration-150 ${
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
                        className={`relative flex w-full flex-col justify-end overflow-hidden transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[var(--app-bar-coauthor-hover)] outline outline-1 outline-[var(--app-ink)]'
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
                        className={`block w-full transition-colors duration-150 ${
                          isSelected || isHovered
                            ? 'bg-[var(--app-ink)]'
                            : 'bg-[var(--app-accent)]'
                        }`}
                      />
                    )}
                  </button>

                  <span
                    className={`mt-2 h-5 font-mono text-[10px] leading-none [font-variant-numeric:tabular-nums] ${
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const PublicationTimelineChart = memo(PublicationTimelineChartComponent);
