'use client';

import React, { memo, useMemo, useState } from 'react';
import { BarChart3, X } from 'lucide-react';
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

    // 連續補齊起迄年份，真實呈現 30+ 年學術軌跡
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
    <div className="mb-10 rounded-2xl border border-[#e5dfd5] bg-white p-5 shadow-[0_2px_18px_rgba(20,19,17,0.04)] md:p-7">
      {/* 標題與模式切換 */}
      <div className="mb-5 flex flex-col gap-4 border-b border-[#efeae0] pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#8a6522]">
            <BarChart3 className="h-3.5 w-3.5" aria-hidden />
            {isZh
              ? `歷年發表與引用軌跡（${minYear}–${maxYear}）`
              : `PUBLICATION & CITATION TIMELINE (${minYear}–${maxYear})`}
          </div>
          <p className="mt-1 text-xs text-[#6b655d]">
            {isZh
              ? '點擊任一年份長條即可直接篩選該年度著作；再次點擊可取消篩選'
              : 'Click any year bar to filter publications from that year; click again to reset'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeYearNum ? (
            <button
              type="button"
              onClick={() => onSelectYear('All')}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#9a742e] bg-[#f5efe2] px-3.5 py-1.5 font-mono text-xs font-medium text-[#7f5d1e] transition-colors hover:bg-[#181614] hover:border-[#181614] hover:text-[#faf8f4]"
            >
              {isZh ? `已篩選：${activeYearNum} 年` : `Filtered: ${activeYearNum}`}
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}

          <div
            role="group"
            aria-label={isZh ? '圖表指標切換' : 'Timeline metric toggle'}
            className="inline-flex rounded-full border border-[#dcd4c7] bg-[#f5f1e9] p-0.5"
          >
            <button
              type="button"
              onClick={() => setMetric('papers')}
              aria-pressed={metric === 'papers'}
              className={`rounded-full px-3.5 py-1 font-mono text-xs transition-colors ${
                metric === 'papers'
                  ? 'bg-[#181614] font-semibold text-[#faf8f4]'
                  : 'text-[#57524b] hover:text-[#141311]'
              }`}
            >
              {isZh ? '發表篇數' : 'Papers / yr'}
            </button>
            <button
              type="button"
              onClick={() => setMetric('citations')}
              aria-pressed={metric === 'citations'}
              className={`rounded-full px-3.5 py-1 font-mono text-xs transition-colors ${
                metric === 'citations'
                  ? 'bg-[#181614] font-semibold text-[#faf8f4]'
                  : 'text-[#57524b] hover:text-[#141311]'
              }`}
            >
              {isZh ? '年度引用數' : 'Citations / yr'}
            </button>
          </div>
        </div>
      </div>

      {/* 即時互動資訊條（清楚展示懸停或已選年份的精確數字，不會在手機上被裁切） */}
      <div
        className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#ece6dc] bg-[#faf8f4] px-4 py-2.5 text-xs"
        aria-live="polite"
      >
        {inspectedBucket ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#141311]">
            <span className="font-mono text-sm font-bold text-[#8a6522]">
              {inspectedBucket.year}
            </span>
            <span>
              {isZh ? '發表篇數：' : 'Papers: '}
              <strong className="font-mono">{inspectedBucket.count}</strong>
            </span>
            <span>
              {isZh ? '通訊作者：' : 'Corresponding: '}
              <strong className="font-mono">{inspectedBucket.starredCount}</strong>
            </span>
            <span>
              {isZh ? '累計引用：' : 'Citations: '}
              <strong className="font-mono">
                {inspectedBucket.citations.toLocaleString('en-US')}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#57524b]">
            {peakBucket ? (
              <span>
                {isZh
                  ? `最高產年度：${peakBucket.year} 年（${peakBucket.count} 篇）`
                  : `Peak output: ${peakBucket.year} (${peakBucket.count} papers)`}
              </span>
            ) : null}
            <span>
              {isZh
                ? `通訊作者共 ${totalStarred} 篇`
                : `${totalStarred} corresponding-author papers`}
            </span>
          </div>
        )}

        {/* 圖例 */}
        {metric === 'papers' ? (
          <div className="flex items-center gap-3.5 font-mono text-[11px] text-[#6b655d]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#9a742e]" aria-hidden />
              {isZh ? '通訊作者' : 'Corresponding'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#d5cbb9]" aria-hidden />
              {isZh ? '共同作者' : 'Co-author'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#6b655d]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#9a742e]" aria-hidden />
            {isZh ? '該年度發表論文之累計引用數' : 'Cumulative citations by publication year'}
          </div>
        )}
      </div>

      {/* 長條圖本體（手機橫向捲動、桌機滿版等距） */}
      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[620px] pt-2">
          {/* 背景水平刻度虛線 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-7 top-2 flex flex-col justify-between">
            {[1, 0.5, 0].map((ratio, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-9 shrink-0 text-right font-mono text-[10px] text-[#9a9287]">
                  {Math.round(maxMetricValue * ratio).toLocaleString('en-US')}
                </span>
                <div className="h-px flex-1 border-b border-dashed border-[#eae4d9]" />
              </div>
            ))}
          </div>

          {/* 年份柱狀列 */}
          <div
            className="relative z-10 ml-11 flex h-40 items-end gap-[3px] sm:gap-1"
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
                    onClick={() =>
                      onSelectYear(isSelected ? 'All' : String(b.year))
                    }
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
                      <span className="h-[2px] w-full rounded-full bg-[#efeae0]" />
                    ) : metric === 'papers' ? (
                      <span
                        style={{ height: `${heightPct}%` }}
                        className={`relative flex w-full flex-col justify-end overflow-hidden rounded-t-[4px] transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#181614] ring-2 ring-[#9a742e]/45'
                            : isHovered
                              ? 'bg-[#292622]'
                              : 'bg-[#d5cbb9]'
                        }`}
                      >
                        {/* 通訊作者比例（古銅金色底段） */}
                        {b.starredCount > 0 ? (
                          <span
                            style={{ height: `${starredRatio}%` }}
                            className={`w-full transition-colors ${
                              isSelected ? 'bg-[#9a742e]' : 'bg-[#9a742e]/90 group-hover:bg-[#b58a38]'
                            }`}
                          />
                        ) : null}
                      </span>
                    ) : (
                      <span
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-[4px] transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#181614] ring-2 ring-[#9a742e]/45'
                            : isHovered
                              ? 'bg-[#181614]'
                              : 'bg-[#9a742e]/80'
                        }`}
                      />
                    )}
                  </button>

                  <span
                    className={`mt-2 h-5 font-mono text-[10px] leading-none ${
                      isSelected
                        ? 'font-bold text-[#141311]'
                        : showLabel
                          ? 'text-[#6b655d]'
                          : 'text-transparent select-none'
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
