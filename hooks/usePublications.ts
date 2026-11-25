'use client';

import { useState, useEffect, useMemo, useCallback, startTransition } from 'react';
import {
  Publication,
  computeHIndex,
  getPublicationKey,
} from '@/lib/publications';
import { computeFeaturedPublications } from '@/lib/publicationDisplay';
import {
  getResearchDomainById,
  publicationMatchesDomain,
} from '@/lib/researchDomains';
import {
  fetchPapersFromRemote,
  readCachedPapers,
  writeCachedPapers,
} from '@/lib/papersCache';

/** Filter union type for type safety */
export type PubFilter = 'All' | 'Selected' | (string & {});
export type PubSort = 'newest' | 'citations' | 'starred';
export type PubViewMode = 'card' | 'compact';

const PUB_PAGE_DESKTOP = 10;
const PUB_PAGE_MOBILE = 6;
const PUB_PAGE_COMPACT = 30;

function buildDatasetSignature(list: Publication[]): string {
  const totalCitations = list.reduce((sum, p) => sum + p.citations, 0);
  const firstKey = list[0] ? getPublicationKey(list[0], 0) : '';
  const lastKey = list[list.length - 1] ? getPublicationKey(list[list.length - 1], list.length - 1) : '';
  return `${list.length}:${totalCitations}:${firstKey}:${lastKey}`;
}

/**
 * Encapsulates publication data fetching (ISR + SWR no-cache revalidation),
 * local caching, sorting, filtering, keyword search, view mode, and pagination logic.
 */
export function usePublications(
  isMobile: boolean,
  initialPublications?: Publication[] | null,
) {
  const hasInitial = Array.isArray(initialPublications) && initialPublications.length > 0;
  const [pubFilter, setPubFilter] = useState<PubFilter>('All');
  const [pubSort, setPubSort] = useState<PubSort>('newest');
  const [correspondingOnly, setCorrespondingOnly] = useState(false);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<PubViewMode>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PUB_PAGE_DESKTOP);
  const [publications, setPublications] = useState<Publication[]>(
    () => (hasInitial ? initialPublications : []),
  );
  const [isLoading, setIsLoading] = useState(!hasInitial);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const pageSize =
    viewMode === 'compact'
      ? PUB_PAGE_COMPACT
      : isMobile
        ? PUB_PAGE_MOBILE
        : PUB_PAGE_DESKTOP;

  // 僅於需要放大時擴充顯示筆數，避免桌機掛載 10→6→10 閃動或旋轉螢幕重置已載入分頁
  useEffect(() => {
    setVisibleCount((prev) => Math.max(prev, pageSize));
  }, [pageSize]);

  // 同步伺服器刷新之 initialPublications 或還原本地快取
  useEffect(() => {
    if (hasInitial) {
      writeCachedPapers(initialPublications);
      setPublications((prev) => (prev === initialPublications ? prev : initialPublications));
      setIsUsingFallback(false);
      setIsLoading(false);
      return;
    }
    const cached = readCachedPapers();
    if (cached && cached.length > 0) {
      setPublications(cached);
      setIsLoading(false);
    }
  }, [hasInitial, initialPublications]);

  // SSR 已注入非空 initialPublications 時，直接信任 On-Demand ISR 最新輸出，不再於掛載時重複全量拉取
  useEffect(() => {
    if (hasInitial) return;

    const controller = new AbortController();
    let cancelled = false;

    const loadPublications = async () => {
      try {
        const fresh = await fetchPapersFromRemote(controller.signal);
        if (cancelled) return;

        writeCachedPapers(fresh);
        startTransition(() => {
          setPublications((prev) =>
            prev.length > 0 && buildDatasetSignature(prev) === buildDatasetSignature(fresh)
              ? prev
              : fresh,
          );
          setIsUsingFallback(false);
          setIsLoading(false);
        });
        return;
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        console.warn('Fetch publications failed, using cache/fallback:', err);

        const cached = readCachedPapers();
        if (cached && cached.length > 0) {
          startTransition(() => {
            setPublications(cached);
            setIsUsingFallback(false);
            setIsLoading(false);
          });
          return;
        }

        try {
          const localData = await import('@/lib/publications');
          if (cancelled) return;
          startTransition(() => {
            setPublications(localData.publications);
            setIsUsingFallback(true);
            setIsLoading(false);
          });
          return;
        } catch {
          /* final fallback: empty list */
        }
      }

      if (!cancelled) setIsLoading(false);
    };

    void loadPublications();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [hasInitial]);

  // Derived data — filter out invalid/0 years
  const uniqueYears = useMemo(
    () =>
      Array.from(
        new Set(
          publications
            .map((p) => p.year)
            .filter((y) => Number.isFinite(y) && y >= 1900)
            .map((y) => String(y)),
        ),
      ).sort((a, b) => Number(b) - Number(a)),
    [publications],
  );

  const sortedPublications = useMemo(() => {
    const result = [...publications];
    result.sort((a, b) => {
      if (pubSort === 'citations') {
        if (b.citations !== a.citations) return b.citations - a.citations;
        if (b.year !== a.year) return b.year - a.year;
        return a.title.localeCompare(b.title);
      }
      if (pubSort === 'starred') {
        if (a.is_star === '是' && b.is_star !== '是') return -1;
        if (a.is_star !== '是' && b.is_star === '是') return 1;
        if (b.year !== a.year) return b.year - a.year;
        return b.citations - a.citations;
      }
      // Default: 'newest' — 讓訪客第一眼就能看到最新年度發表
      if (b.year !== a.year) return b.year - a.year;
      if (a.is_star === '是' && b.is_star !== '是') return -1;
      if (a.is_star !== '是' && b.is_star === '是') return 1;
      return b.citations - a.citations;
    });
    return result;
  }, [publications, pubSort]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const activeDomain = useMemo(() => getResearchDomainById(activeDomainId), [activeDomainId]);

  const filteredPublications = useMemo(() => {
    let list = sortedPublications;
    if (pubFilter === 'Selected') {
      list = list.filter((p) => p.citations >= 50);
    } else if (pubFilter !== 'All') {
      list = list.filter((p) => String(p.year) === pubFilter);
    }

    if (correspondingOnly) {
      list = list.filter((p) => p.is_star === '是');
    }

    if (activeDomain) {
      list = list.filter((p) => publicationMatchesDomain(p, activeDomain));
    }

    if (selectedJournal) {
      list = list.filter((p) => p.journal.trim() === selectedJournal);
    }

    if (normalizedQuery) {
      list = list.filter((p) => {
        const haystack = `${p.title} ${p.journal} ${p.year} ${p.authors ?? ''} ${p.doi}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }
    return list;
  }, [pubFilter, correspondingOnly, activeDomain, selectedJournal, normalizedQuery, sortedPublications]);

  // 僅在未套用年份／高引用／領域／期刊／搜尋／僅通訊作者篩選時顯示置頂精選區
  const isDefaultAllView =
    pubFilter === 'All' &&
    normalizedQuery === '' &&
    !correspondingOnly &&
    activeDomainId === null &&
    selectedJournal === null;

  const featuredPublications = useMemo(
    () => (isDefaultAllView ? computeFeaturedPublications(publications, 3) : []),
    [isDefaultAllView, publications],
  );

  const featuredKeys = useMemo(
    () => new Set(featuredPublications.map((p) => getPublicationKey(p))),
    [featuredPublications],
  );

  const publicationsRows = useMemo(
    () =>
      isDefaultAllView
        ? filteredPublications.filter((p) => !featuredKeys.has(getPublicationKey(p)))
        : filteredPublications,
    [isDefaultAllView, filteredPublications, featuredKeys],
  );

  const visiblePublications = useMemo(
    () => publicationsRows.slice(0, visibleCount),
    [publicationsRows, visibleCount],
  );

  // 進入本地精選 10 篇 fallback 時，不應把總論文數降成 10 篇誤導訪客
  const hasFullMetrics = !isUsingFallback && publications.length > 0;
  const { totalPubs, totalCitations, hIndexValue } = useMemo<{
    totalPubs: number | string;
    totalCitations: number | string;
    hIndexValue: number | string;
  }>(() => {
    if (!hasFullMetrics) {
      return { totalPubs: '200+', totalCitations: '8,000+', hIndexValue: '52' };
    }
    return {
      totalPubs: publications.length,
      totalCitations: publications.reduce((sum, p) => sum + p.citations, 0),
      hIndexValue: computeHIndex(publications),
    };
  }, [hasFullMetrics, publications]);

  const handlePubFilterChange = useCallback(
    (value: string) => {
      setPubFilter(value as PubFilter);
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  const handlePubSortChange = useCallback(
    (value: PubSort) => {
      setPubSort(value);
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  const handleCorrespondingToggle = useCallback(() => {
    setCorrespondingOnly((prev) => !prev);
    setVisibleCount(pageSize);
  }, [pageSize]);

  const handleViewModeChange = useCallback(
    (mode: PubViewMode) => {
      setViewMode(mode);
      setVisibleCount(
        mode === 'compact' ? PUB_PAGE_COMPACT : isMobile ? PUB_PAGE_MOBILE : PUB_PAGE_DESKTOP,
      );
    },
    [isMobile],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  const handleDomainFilterChange = useCallback(
    (domainId: string | null) => {
      setActiveDomainId(domainId);
      if (domainId !== null) {
        setPubFilter('All');
        setSelectedJournal(null);
        setCorrespondingOnly(false);
        setSearchQuery('');
      }
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  const handleJournalFilterChange = useCallback(
    (journal: string | null) => {
      setSelectedJournal(journal);
      if (journal !== null) {
        setActiveDomainId(null);
        setPubFilter('All');
        setCorrespondingOnly(false);
        setSearchQuery('');
      }
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  /** 由歷年長條圖點擊指定年份時，清除其他殘留篩選，確保跳轉後的篇數與長條圖顯示數字完全一致 */
  const handleTimelineYearSelect = useCallback(
    (yearOrAll: string) => {
      setPubFilter(yearOrAll as PubFilter);
      if (yearOrAll !== 'All') {
        setActiveDomainId(null);
        setSelectedJournal(null);
        setCorrespondingOnly(false);
        setSearchQuery('');
      }
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  const handleKeywordQuickFilter = useCallback(
    (keyword: string) => {
      setActiveDomainId(null);
      setSelectedJournal(null);
      setCorrespondingOnly(false);
      setPubFilter('All');
      setSearchQuery(keyword);
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  const handleResetAllFilters = useCallback(() => {
    setPubFilter('All');
    setCorrespondingOnly(false);
    setActiveDomainId(null);
    setSelectedJournal(null);
    setSearchQuery('');
    setVisibleCount(pageSize);
  }, [pageSize]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + pageSize);
  }, [pageSize]);

  return {
    allPublications: publications,
    pubFilter,
    pubSort,
    correspondingOnly,
    activeDomainId,
    selectedJournal,
    viewMode,
    searchQuery,
    uniqueYears,
    isLoading,
    isUsingFallback,
    featuredPublications,
    visiblePublications,
    filteredPublications,
    publicationsRows,
    totalPubs,
    totalCitations,
    hIndexValue,
    handlePubFilterChange,
    handlePubSortChange,
    handleCorrespondingToggle,
    handleDomainFilterChange,
    handleJournalFilterChange,
    handleTimelineYearSelect,
    handleKeywordQuickFilter,
    handleResetAllFilters,
    handleViewModeChange,
    handleSearchChange,
    handleLoadMore,
  };
}
