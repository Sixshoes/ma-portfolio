'use client';

import { useState, useEffect, useMemo, useCallback, startTransition } from 'react';
import React from 'react';
import { Publication, normalizePublicationsFromJson } from '@/lib/publications';
import { computeFeaturedPublications } from '@/lib/publicationDisplay';
import { PAPERS_JSON_URL, readCachedPapers, writeCachedPapers } from '@/lib/papersCache';

/** Filter union type for type safety */
export type PubFilter = 'All' | 'Selected' | (string & {});

const PUB_PAGE_DESKTOP = 10;
const PUB_PAGE_MOBILE = 6;

/**
 * Encapsulates all publication data fetching, caching, sorting, filtering,
 * and pagination logic. Previously inlined in main/page.tsx (~100 lines).
 */
export function usePublications(isMobile: boolean) {
  const [pubFilter, setPubFilter] = useState<PubFilter>('All');
  const [visibleCount, setVisibleCount] = useState(PUB_PAGE_DESKTOP);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setVisibleCount(isMobile ? PUB_PAGE_MOBILE : PUB_PAGE_DESKTOP);
  }, [isMobile]);

  // Synchronous cache restore (before paint)
  useEffect(() => {
    const cached = readCachedPapers();
    if (cached && cached.length > 0) {
      setPublications(cached);
      setIsLoading(false);
    }
  }, []);

  // Async fetch with triple fallback
  useEffect(() => {
    let cancelled = false;

    const loadPublications = async () => {
      try {
        const res = await fetch(PAPERS_JSON_URL, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (cancelled) return;

        if (Array.isArray(data) && data.length > 0) {
          const parsed = normalizePublicationsFromJson(data);
          writeCachedPapers(parsed);
          startTransition(() => {
            setPublications(parsed);
            setIsLoading(false);
          });
          return;
        }
      } catch (err) {
        if (cancelled) return;
        console.warn('Fetch papers.json failed, loading fallback:', err);

        const cached = readCachedPapers();
        if (cached && cached.length > 0) {
          startTransition(() => { setPublications(cached); setIsLoading(false); });
          return;
        }

        try {
          const localData = await import('@/lib/publications');
          if (cancelled) return;
          startTransition(() => { setPublications(localData.publications); setIsLoading(false); });
          return;
        } catch { /* final fallback: empty list */ }
      }

      if (!cancelled) setIsLoading(false);
    };

    void loadPublications();
    return () => { cancelled = true; };
  }, []);

  // Derived data
  const uniqueYears = useMemo(
    () => Array.from(new Set(publications.map((p) => String(p.year)))).sort((a, b) => Number(b) - Number(a)),
    [publications],
  );

  const sortedPublications = useMemo(() => {
    const result = [...publications];
    result.sort((a, b) => {
      if (a.is_star === '是' && b.is_star !== '是') return -1;
      if (a.is_star !== '是' && b.is_star === '是') return 1;
      if (b.year !== a.year) return b.year - a.year;
      return b.citations - a.citations;
    });
    return result;
  }, [publications]);

  const filteredPublications = useMemo(() => {
    if (pubFilter === 'Selected') return sortedPublications.filter((p) => p.citations >= 50);
    if (pubFilter !== 'All') return sortedPublications.filter((p) => String(p.year) === pubFilter);
    return sortedPublications;
  }, [pubFilter, sortedPublications]);

  const featuredPublications = useMemo(() => computeFeaturedPublications(publications, 3), [publications]);
  const featuredDois = useMemo(() => new Set(featuredPublications.map((p) => p.doi)), [featuredPublications]);
  const publicationsRows = useMemo(() => filteredPublications.filter((p) => !featuredDois.has(p.doi)), [filteredPublications, featuredDois]);
  const visiblePublications = useMemo(() => publicationsRows.slice(0, visibleCount), [publicationsRows, visibleCount]);

  const totalPubs = publications.length > 0 ? publications.length : '200+';
  const totalCitations = publications.length > 0 ? publications.reduce((sum, p) => sum + p.citations, 0) : '5000+';

  const handlePubFilterChange = useCallback((value: string) => {
    setPubFilter(value as PubFilter);
    setVisibleCount(isMobile ? PUB_PAGE_MOBILE : PUB_PAGE_DESKTOP);
  }, [isMobile]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + (isMobile ? PUB_PAGE_MOBILE : PUB_PAGE_DESKTOP));
  }, [isMobile]);

  return {
    pubFilter,
    uniqueYears,
    isLoading,
    featuredPublications,
    visiblePublications,
    filteredPublications,
    publicationsRows,
    totalPubs,
    totalCitations,
    handlePubFilterChange,
    handleLoadMore,
  };
}
