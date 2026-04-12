import type { ReactNode } from 'react';
import type { Publication } from '@/lib/publications';

/** 通訊／第一作者優先，再以引用排序，取前 N 篇作為置頂精選 */
export function computeFeaturedPublications(list: Publication[], n = 3): Publication[] {
  if (list.length === 0) return [];
  const sorted = [...list].sort((a, b) => {
    if (a.is_star === '是' && b.is_star !== '是') return -1;
    if (a.is_star !== '是' && b.is_star === '是') return 1;
    return b.citations - a.citations;
  });
  return sorted.slice(0, n);
}

export function parseTakeawayLines(takeaway?: string): string[] {
  if (!takeaway?.trim()) return [];
  return takeaway
    .split(/\||\n+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

const HIGHLIGHT_NAME =
  /(馬遠榮|Yuan-Ron\s+Ma|Y\.\s*-?\s*R\.\s*Ma|Y\.\s*R\.\s*Ma|\bMa\s*,\s*Y\.?\s*-?\s*R\.?)/i;

export function splitAuthorsHighlighted(authors: string): ReactNode[] {
  const segments = authors.split(/,\s*/).filter(Boolean);
  return segments.map((segment, i) => {
    const isLead = HIGHLIGHT_NAME.test(segment);
    const node = isLead ? (
      <strong key={i} className="font-semibold text-[#e8dcc4]">
        {segment}
      </strong>
    ) : (
      <span key={i} className="text-stone-500">
        {segment}
      </span>
    );
    return (
      <span key={`wrap-${i}`}>
        {i > 0 ? <span className="text-stone-600">, </span> : null}
        {node}
      </span>
    );
  });
}
