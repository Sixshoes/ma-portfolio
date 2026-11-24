'use client';

import React, { memo, useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import type { Publication } from '@/lib/publications';
import { useTheme } from '@/app/ThemeContext';
import { EDITORIAL_EASE } from './EditorialMotion';

type TopJournalsChartProps = {
  publications: Publication[];
  selectedJournal: string | null;
  lang: 'en' | 'zh';
  onSelectJournal: (journal: string | null) => void;
};

type JournalRow = {
  journal: string;
  count: number;
  citations: number;
};

const BAR_COLORS_LIGHT = [
  '#1B4965',
  '#235A70',
  '#2A6F68',
  '#3A7D72',
  '#567A75',
  '#7D7A58',
  '#A67E3B',
  '#B67638',
  '#9E4B3B',
  '#4A586E',
];

/** 夜間模式高對比柔和礦物色譜（對 #1A1E23 卡片皆 ≥ 4.5:1 對比度） */
const BAR_COLORS_DARK = [
  '#6FA3C7',
  '#68B0B5',
  '#6CC0A9',
  '#7DC59C',
  '#9ABFA8',
  '#C4BA78',
  '#DFB562',
  '#E09F63',
  '#DF8478',
  '#9BAAC4',
];

/** Top 10 核心發表國際期刊互動橫向排行圖（圓潤端點長條，點擊即時篩選下方論文） */
function TopJournalsChartComponent({
  publications,
  selectedJournal,
  lang,
  onSelectJournal,
}: TopJournalsChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();
  const isZh = lang === 'zh';

  const { rows, maxCount } = useMemo(() => {
    const map = new Map<string, JournalRow>();
    for (const p of publications) {
      const name = p.journal?.trim();
      if (!name || name === 'Unknown') continue;
      const existing = map.get(name);
      if (existing) {
        existing.count += 1;
        existing.citations += p.citations;
      } else {
        map.set(name, { journal: name, count: 1, citations: p.citations });
      }
    }

    const sorted = Array.from(map.values())
      .sort((a, b) => b.count - a.count || b.citations - a.citations)
      .slice(0, 10);

    return {
      rows: sorted,
      maxCount: sorted[0]?.count ?? 1,
    };
  }, [publications]);

  if (rows.length === 0) return null;

  return (
    <div ref={cardRef} className="atlas-card flex h-full flex-col justify-between p-5 sm:p-6">
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="font-editorial text-xl font-semibold text-[var(--app-ink)]">
            {isZh ? 'Top 10 核心國際期刊排行' : 'Top 10 International Journals'}
          </h3>
          {selectedJournal ? (
            <button
              type="button"
              onClick={() => onSelectJournal(null)}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--app-ink)] bg-[var(--app-ink)] px-3 py-1 text-xs text-[var(--app-bg)] transition-colors hover:border-[var(--app-accent)] hover:bg-[var(--app-accent)]"
            >
              {isZh ? '清除' : 'Clear'}
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="space-y-2.5">
          {rows.map((row, idx) => {
            const pct = Math.max(8, Math.round((row.count / maxCount) * 100));
            const isSelected = selectedJournal === row.journal;
            const palette = isDark ? BAR_COLORS_DARK : BAR_COLORS_LIGHT;
            const barColor = palette[idx % palette.length];

            return (
              <button
                key={row.journal}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectJournal(isSelected ? null : row.journal)}
                className={`group block w-full rounded-xl px-2.5 py-1.5 text-left transition-colors ${
                  isSelected
                    ? 'bg-[var(--app-hover)] ring-1 ring-[var(--app-accent)]'
                    : 'hover:bg-[var(--app-hover)]/75'
                }`}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2 text-[13.5px]">
                  <span
                    className={`line-clamp-2 min-w-0 leading-snug ${
                      isSelected
                        ? 'font-semibold text-[var(--app-accent)]'
                        : 'font-medium text-[var(--app-ink)] group-hover:text-[var(--app-accent)]'
                    }`}
                    title={row.journal}
                  >
                    <span className="mr-1.5 font-mono text-xs text-[var(--app-muted)]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-journal-italic">{row.journal}</span>
                  </span>
                  <span className="mt-0.5 shrink-0 whitespace-nowrap font-mono text-xs text-[var(--app-muted)] [font-variant-numeric:tabular-nums]">
                    <strong className="text-[var(--app-ink)]">{row.count}</strong>
                    {isZh ? ' 篇 · ' : ' · '}
                    {row.citations.toLocaleString('en-US')} {isZh ? '引' : 'cit.'}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--app-rule)]/55">
                  <motion.div
                    initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                    animate={{ scaleX: isInView || reduceMotion ? 1 : 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.65,
                      delay: reduceMotion ? 0 : idx * 0.035,
                      ease: EDITORIAL_EASE,
                    }}
                    style={{
                      width: `${pct}%`,
                      transformOrigin: 'left',
                      backgroundColor: isSelected ? 'var(--app-accent)' : barColor,
                    }}
                    className="h-full rounded-r-full will-change-transform"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const TopJournalsChart = memo(TopJournalsChartComponent);
