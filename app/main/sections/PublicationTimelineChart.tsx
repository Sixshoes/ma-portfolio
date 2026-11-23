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

function PublicationTimelineChartComponent({
  publications,
  selectedFilter,
  lang,
  onSelectYear,
}: PublicationTimelineChartProps) {
  const [metric, setMetric] = useState<'papers' | 'citations'>('papers');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const { buckets, minYear, maxYear, peakBucket, totalStarred, maxMetricValue } = useMemo(() => {
    const valid = publications.filter((p) => Number.isFinite(p.year) && p.year >= 1900 && p.year <= 2100);
    if (valid.length === 0) {
      return {
        buckets: [] as YearBucket[],
        minYear: 0,
        maxYear: 0,
        peakBucket: null as YearBucket | null,
        totalStarred: 0,
        maxMetricValue: 1,
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
    };
  }, [publications, metric]);

  if (buckets.length < 2) return null;

  const activeYearNum = /^\d{4}$/.test(selectedFilter) ? Number(selectedFilter) : null;
  const inspectedYear = hoveredYear ?? activeYearNum;
  const inspectedBucket = inspectedYear
    ? buckets.find((b) => b.year === inspectedYear) ?? null
    : null;

  const isZh = lang === 'zh';

  return (
    <div className="mb-10 rounded-xl border border-white/[0.09] bg-[#0e0d0c] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:p-7">
      {/* 頂部標題列與指標切換 */}
      <div className="mb-5 flex flex-col gap-4 border-b border-white/[0.07] pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-px w-4 bg-[#c8a464]" aria-hidden />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#e2c992]">
              {isZh
                ? `歷年發表與引用軌跡 · ${minYear}–${maxYear}`
                : `PUBLICATION & CITATION ARCHIVE · ${minYear}–${maxYear}`}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-[#8f8980]">
            {isZh
              ? '點擊任一年份長條即可篩選該年度著作；再次點擊取消篩選'
              : 'Select any year bar to filter works; click again to clear'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeYearNum ? (
            <button
              type="button"
              onClick={() => onSelectYear('All')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#c8a464]/55 bg-[#c8a464]/15 px-3 py-1.5 font-mono text-xs text-[#e5cea0] transition-colors hover:bg-[#c8a464] hover:text-[#080807]"
            >
              {isZh ? `${activeYearNum} 年` : `Year ${activeYearNum}`}
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}

          <div
            role="group"
            aria-label={isZh ? '圖表指標切換' : 'Timeline metric toggle'}
            className="inline-flex rounded-lg border border-white/[0.1] bg-[#080807] p-0.5"
          >
            <button
              type="button"
              onClick={() => setMetric('papers')}
              aria-pressed={metric === 'papers'}
              className={`rounded-md px-3.5 py-1 font-mono text-xs transition-colors ${
                metric === 'papers'
                  ? 'bg-[#f5f3ef] font-semibold text-[#080807]'
                  : 'text-[#8f8980] hover:text-[#f5f3ef]'
              }`}
            >
              {isZh ? '發表篇數' : 'Papers / yr'}
            </button>
            <button
              type="button"
              onClick={() => setMetric('citations')}
              aria-pressed={metric === 'citations'}
              className={`rounded-md px-3.5 py-1 font-mono text-xs transition-colors ${
                metric === 'citations'
                  ? 'bg-[#f5f3ef] font-semibold text-[#080807]'
                  : 'text-[#8f8980] hover:text-[#f5f3ef]'
              }`}
            >
              {isZh ? '年度引用數' : 'Citations / yr'}
            </button>
          </div>
        </div>
      </div>

      {/* 精準數據讀取條 */}
      <div
        className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#141311] px-4 py-2.5 text-xs"
        aria-live="polite"
      >
        {inspectedBucket ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[#d6d1c9]">
            <span className="font-mono text-sm font-semibold text-[#e5cea0]">
              {inspectedBucket.year}
            </span>
            <span>
              {isZh ? '發表篇數 ' : 'Papers '}
              <strong className="font-mono text-[#f5f3ef]">{inspectedBucket.count}</strong>
            </span>
            <span>
              {isZh ? '通訊作者 ' : 'Corresponding '}
              <strong className="font-mono text-[#e2c992]">{inspectedBucket.starredCount}</strong>
            </span>
            <span>
              {isZh ? '累計引用 ' : 'Citations '}
              <strong className="font-mono text-[#f5f3ef]">
                {inspectedBucket.citations.toLocaleString('en-US')}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[#9b958c]">
            {peakBucket ? (
              <span>
                {isZh ? '最高產年度：' : 'Peak year: '}
                <strong className="font-mono text-[#f5f3ef]">
                  {peakBucket.year}
                </strong>{' '}
                ({peakBucket.count} {isZh ? '篇' : 'papers'})
              </span>
            ) : null}
            <span>
              {isZh ? '通訊作者：' : 'Corresponding: '}
              <strong className="font-mono text-[#e2c992]">{totalStarred}</strong>{' '}
              {isZh ? '篇' : 'works'}
            </span>
          </div>
        )}

        {metric === 'papers' ? (
          <div className="flex items-center gap-4 font-mono text-[11px] text-[#8f8980]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[2px] bg-[#c8a464]" aria-hidden />
              {isZh ? '通訊作者' : 'Corresponding'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[2px] bg-[#3b3935]" aria-hidden />
              {isZh ? '共同作者' : 'Co-author'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8f8980]">
            <span className="h-2 w-2 rounded-[2px] bg-[#c8a464]" aria-hidden />
            {isZh ? '依發表年份統計之累計引用數' : 'Cumulative citations by publication year'}
          </div>
        )}
      </div>

      {/* 長條圖本體 */}
      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[620px] pt-2">
          {/* 背景極細水平輔助線 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-7 top-2 flex flex-col justify-between">
            {[1, 0.5, 0].map((ratio, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span className="w-9 shrink-0 text-right font-mono text-[10px] text-[#6d6860] [font-variant-numeric:tabular-nums]">
                  {Math.round(maxMetricValue * ratio).toLocaleString('en-US')}
                </span>
                <div className="h-px flex-1 border-b border-dashed border-white/[0.06]" />
              </div>
            ))}
          </div>

          {/* 柱狀列 */}
          <div
            className="relative z-10 ml-12 flex h-40 items-end gap-[3px] sm:gap-1"
            onMouseLeave={() => setHoveredYear(null)}
          >
            {buckets.map((b, idx) => {
              const value = metric === 'papers' ? b.count : b.citations;
              const heightPct = value > 0 ? Math.max(5, (value / maxMetricValue) * 100) : 0;
              const starredRatio = b.count > 0 ? (b.starredCount / b.count) * 100 : 0;
              const isSelected = activeYearNum === b.year;
              const isHovered = hoveredYear === b.year;
              const isEmpty = b.count === 0;
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
                        ? `${b.year} 年：${b.count} 篇論文，${b.citations} 次引用`
                        : `${b.year}: ${b.count} papers, ${b.citations} citations`
                    }
                    aria-pressed={isSelected}
                    className={`group flex h-full w-full items-end justify-center pt-1 focus:outline-none ${
                      isEmpty ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    {isEmpty ? (
                      <span className="h-[2px] w-full bg-white/[0.06]" />
                    ) : metric === 'papers' ? (
                      <span
                        style={{ height: `${heightPct}%` }}
                        className={`relative flex w-full flex-col justify-end overflow-hidden rounded-t-[3px] transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#e5cea0]/40 ring-1 ring-[#e5cea0]'
                            : isHovered
                              ? 'bg-[#5a564f]'
                              : 'bg-[#363430]'
                        }`}
                      >
                        {b.starredCount > 0 ? (
                          <span
                            style={{ height: `${starredRatio}%` }}
                            className={`w-full transition-colors ${
                              isSelected
                                ? 'bg-[#e5cea0]'
                                : 'bg-gradient-to-t from-[#967336] to-[#d6b676] group-hover:from-[#b38c46] group-hover:to-[#ecd8b0]'
                            }`}
                          />
                        ) : null}
                      </span>
                    ) : (
                      <span
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-[3px] transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#f5f3ef] ring-1 ring-[#e5cea0]'
                            : isHovered
                              ? 'bg-[#e5cea0]'
                              : 'bg-gradient-to-t from-[#7c5e2b] to-[#c8a464]'
                        }`}
                      />
                    )}
                  </button>

                  <span
                    className={`mt-2 h-5 font-mono text-[10px] leading-none [font-variant-numeric:tabular-nums] ${
                      isSelected
                        ? 'font-bold text-[#e5cea0]'
                        : showLabel
                          ? 'text-[#7d7870]'
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
