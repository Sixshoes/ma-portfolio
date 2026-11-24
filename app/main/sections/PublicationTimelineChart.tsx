'use client';

import React, { memo, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import type { Publication } from '@/lib/publications';

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

/** 無框學報紙張時間軸長條圖：直接繪製於 #F7F6F2 畫布上，通訊作者柱用牛津深藍 #1B365D、共同作者用暖灰 #C8C4B8 */
function PublicationTimelineChartComponent({
  publications,
  selectedFilter,
  lang,
  onSelectYear,
}: PublicationTimelineChartProps) {
  const [metric, setMetric] = useState<'papers' | 'citations'>('papers');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
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

  if (buckets.length < 2) return null;

  const activeYearNum = /^\d{4}$/.test(selectedFilter) ? Number(selectedFilter) : null;
  const inspectedYear = hoveredYear ?? activeYearNum;
  const inspectedBucket = inspectedYear
    ? buckets.find((b) => b.year === inspectedYear) ?? null
    : null;

  const isZh = lang === 'zh';
  const inPressLabel = isZh ? '預刊' : 'In Press';

  return (
    <div className="py-8">
      {/* 頂部無框標題與底線指標切換 */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h3 className="font-editorial text-lg font-semibold text-[#141413]">
              {isZh
                ? `歷年發表與引用分佈（${minYear}–${maxYear}）`
                : `Annual Publication & Citation Record (${minYear}–${maxYear})`}
            </h3>
            {hasInPress ? (
              <span className="border border-[#1B365D] px-1.5 py-0.5 text-[11px] text-[#1B365D]">
                {isZh ? `含 ${maxYear} 預刊` : `incl. ${maxYear} In Press`}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[#5C5953]">
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
              className="inline-flex items-center gap-1 border border-[#141413] bg-[#141413] px-2.5 py-1 text-xs text-[#F7F6F2] transition-colors hover:bg-[#1B365D] hover:border-[#1B365D]"
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
            className="inline-flex items-center gap-4 text-sm"
          >
            <button
              type="button"
              onClick={() => setMetric('papers')}
              aria-pressed={metric === 'papers'}
              className={`border-b-2 pb-1 transition-colors ${
                metric === 'papers'
                  ? 'border-[#141413] font-semibold text-[#141413]'
                  : 'border-transparent text-[#5C5953] hover:text-[#141413]'
              }`}
            >
              {isZh ? '發表篇數' : 'Papers / yr'}
            </button>
            <button
              type="button"
              onClick={() => setMetric('citations')}
              aria-pressed={metric === 'citations'}
              className={`border-b-2 pb-1 transition-colors ${
                metric === 'citations'
                  ? 'border-[#141413] font-semibold text-[#141413]'
                  : 'border-transparent text-[#5C5953] hover:text-[#141413]'
              }`}
            >
              {isZh ? '年度引用數' : 'Citations / yr'}
            </button>
          </div>
        </div>
      </div>

      {/* 無框細線數據讀數與圖例列 */}
      <div
        className="mb-5 flex flex-wrap items-center justify-between gap-2 border-y border-[#D4D1C8] py-2.5 text-xs"
        aria-live="polite"
      >
        {inspectedBucket ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[#2D2C29]">
            <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[#141413]">
              {inspectedBucket.year}
              {inspectedBucket.year > currentYear ? (
                <span className="border border-[#1B365D] px-1 py-0.5 font-sans text-[10px] font-medium text-[#1B365D]">
                  {inPressLabel}
                </span>
              ) : null}
            </span>
            <span>
              {isZh ? '發表篇數 ' : 'Papers '}
              <strong className="font-mono text-[#141413]">{inspectedBucket.count}</strong>
            </span>
            <span>
              {isZh ? '通訊作者 ' : 'Corresponding '}
              <strong className="font-mono text-[#1B365D]">{inspectedBucket.starredCount}</strong>
            </span>
            <span>
              {isZh ? '累計引用 ' : 'Citations '}
              <strong className="font-mono text-[#141413]">
                {inspectedBucket.citations.toLocaleString('en-US')}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[#5C5953]">
            {peakBucket ? (
              <span>
                {isZh ? '最高產年度：' : 'Peak year: '}
                <strong className="font-mono text-[#141413]">{peakBucket.year}</strong> (
                {peakBucket.count} {isZh ? '篇' : 'papers'})
              </span>
            ) : null}
            <span>
              {isZh ? '通訊作者：' : 'Corresponding: '}
              <strong className="font-mono text-[#1B365D]">{totalStarred}</strong>{' '}
              {isZh ? '篇' : 'works'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#5C5953]">
          {metric === 'papers' ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[#1B365D]" aria-hidden />
                {isZh ? '通訊作者' : 'Corresponding'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[#C8C4B8]" aria-hidden />
                {isZh ? '共同作者' : 'Co-author'}
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-[#1B365D]" aria-hidden />
              {isZh ? '依發表年份統計之累計引用數' : 'Cumulative citations by publication year'}
            </span>
          )}
          {hasInPress ? (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 border border-dashed border-[#1B365D] bg-[#E6E4DD]"
                aria-hidden
              />
              {inPressLabel}
            </span>
          ) : null}
        </div>
      </div>

      {/* 長條圖本體（直接落於紙白畫布） */}
      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[620px] pt-2">
          <div className="pointer-events-none absolute inset-x-0 bottom-7 top-2 flex flex-col justify-between">
            {[1, 0.5, 0].map((ratio, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span className="w-9 shrink-0 text-right font-mono text-[10px] text-[#5C5953] [font-variant-numeric:tabular-nums]">
                  {Math.round(maxMetricValue * ratio).toLocaleString('en-US')}
                </span>
                <div className="h-px flex-1 border-b border-dashed border-[#D4D1C8]" />
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
                      <span className="h-px w-full bg-[#D4D1C8]" />
                    ) : isFutureYear ? (
                      <span
                        style={{ height: `${heightPct}%` }}
                        className={`w-full border border-dashed border-[#1B365D] transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[#1B365D]/30'
                            : isHovered
                              ? 'bg-[#1B365D]/20'
                              : 'bg-[#E6E4DD]'
                        }`}
                      />
                    ) : metric === 'papers' ? (
                      <span
                        style={{ height: `${heightPct}%` }}
                        className={`relative flex w-full flex-col justify-end overflow-hidden transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[#ABA79E] outline outline-1 outline-[#141413]'
                            : isHovered
                              ? 'bg-[#B3AFA5]'
                              : 'bg-[#C8C4B8]'
                        }`}
                      >
                        {b.starredCount > 0 ? (
                          <span
                            style={{ height: `${starredRatio}%` }}
                            className={`w-full transition-colors duration-150 ${
                              isSelected
                                ? 'bg-[#141413]'
                                : 'bg-[#1B365D] group-hover:bg-[#141413]'
                            }`}
                          />
                        ) : null}
                      </span>
                    ) : (
                      <span
                        style={{ height: `${heightPct}%` }}
                        className={`w-full transition-colors duration-150 ${
                          isSelected
                            ? 'bg-[#141413]'
                            : isHovered
                              ? 'bg-[#141413]'
                              : 'bg-[#1B365D]'
                        }`}
                      />
                    )}
                  </button>

                  <span
                    className={`mt-2 h-5 font-mono text-[10px] leading-none [font-variant-numeric:tabular-nums] ${
                      isSelected
                        ? 'font-bold text-[#141413]'
                        : showLabel
                          ? isFutureYear
                            ? 'font-medium text-[#1B365D]'
                            : 'text-[#5C5953]'
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
