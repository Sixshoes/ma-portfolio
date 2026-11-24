'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowDownRight,
  BookOpen,
  CornerDownLeft,
  Download,
  Languages,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import type { Publication } from '@/lib/publications';
import { getPublicationKey } from '@/lib/publications';
import type { NavText } from '@/lib/i18n';
import { useLanguage } from '@/app/LanguageContext';
import { useTheme } from '@/app/ThemeContext';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/clientUtils';
import { EDITORIAL_EASE } from './EditorialMotion';

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  publications: Publication[];
  navText: NavText;
  onSelectPublication: (pub: Publication) => void;
  onNavigateSection: (sectionId: string) => void;
  onDownloadVCard: () => void;
};

type PaletteItem = {
  id: string;
  group: 'publications' | 'sections' | 'actions';
  title: string;
  subtitle?: string;
  meta?: string;
  onSelect: (e?: React.MouseEvent<HTMLElement>) => void;
};

const SECTION_META = [
  { id: 'research', num: '§ 01' },
  { id: 'publications', num: '§ 02' },
  { id: 'about', num: '§ 03' },
  { id: 'impact', num: '§ 04' },
  { id: 'contact', num: '§ 05' },
] as const;

/** 無圓角紙本目錄風 ⌘K / Ctrl+K 學術快速檢索面板 */
export function CommandPalette({
  open,
  onClose,
  publications,
  navText,
  onSelectPublication,
  onNavigateSection,
  onDownloadVCard,
}: CommandPaletteProps) {
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isZh = lang === 'zh';

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const themeTimerRef = useRef<number | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (themeTimerRef.current !== null) {
        window.clearTimeout(themeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setQuery('');
    setActiveIndex(0);
    lockBodyScroll();
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      unlockBodyScroll();
      window.clearTimeout(focusTimer);
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const list: PaletteItem[] = [];

    // 1. 論文即時檢索結果
    const matchedPubs = q
      ? publications
          .filter((p) => {
            const hay = `${p.title} ${p.journal} ${p.year} ${p.authors ?? ''} ${p.doi}`.toLowerCase();
            return hay.includes(q);
          })
          .slice(0, 8)
      : [...publications]
          .sort((a, b) => b.year - a.year || b.citations - a.citations)
          .slice(0, 4);

    matchedPubs.forEach((pub, i) => {
      list.push({
        id: `pub-${getPublicationKey(pub, i)}`,
        group: 'publications',
        title: pub.title,
        subtitle: pub.journal,
        meta: `${pub.year > 0 ? pub.year : '—'} · ${pub.citations.toLocaleString('en-US')} ${isZh ? '引' : 'cit.'}`,
        onSelect: () => {
          onClose();
          onSelectPublication(pub);
        },
      });
    });

    // 2. 章節快速跳轉
    const sectionItems: PaletteItem[] = SECTION_META.map((sec) => ({
      id: `sec-${sec.id}`,
      group: 'sections',
      title: `${sec.num}  ${navText[sec.id]}`,
      subtitle: isZh ? '跳轉至此章節' : 'Jump to section',
      onSelect: () => {
        onClose();
        onNavigateSection(sec.id);
      },
    }));

    const filteredSections = q
      ? sectionItems.filter((s) => s.title.toLowerCase().includes(q) || s.id.includes(q))
      : sectionItems;
    list.push(...filteredSections);

    // 3. 快捷動作（晝夜切換、中英切換、vCard）
    const actionItems: PaletteItem[] = [
      {
        id: 'act-theme',
        group: 'actions',
        title:
          theme === 'dark'
            ? isZh
              ? '切換為晝讀紙本白版'
              : 'Switch to Paper Light Mode'
            : isZh
              ? '切換為夜讀典藏黑版'
              : 'Switch to Archival Dark Mode',
        subtitle: isZh ? '電致變色圓形光圈轉場' : 'Electrochromic iris transition',
        meta: theme === 'dark' ? (isZh ? '晝' : 'Light') : isZh ? '夜' : 'Dark',
        onSelect: (e) => {
          onClose();
          const hasClickCoords = e && (e.clientX !== 0 || e.clientY !== 0);
          const origin = hasClickCoords
            ? { clientX: e.clientX, clientY: e.clientY }
            : { clientX: window.innerWidth / 2, clientY: 160 };
          if (themeTimerRef.current !== null) window.clearTimeout(themeTimerRef.current);
          themeTimerRef.current = window.setTimeout(() => toggleTheme(origin), 30);
        },
      },
      {
        id: 'act-lang',
        group: 'actions',
        title: isZh ? '切換為英文版（Switch to English）' : 'Switch to Traditional Chinese（切換為中文）',
        subtitle: isZh ? '中英語系即時切換' : 'Toggle interface language',
        meta: isZh ? 'EN' : '中文',
        onSelect: () => {
          setLang(isZh ? 'en' : 'zh');
          onClose();
        },
      },
      {
        id: 'act-vcard',
        group: 'actions',
        title: isZh ? '下載電子名片（Yuan-Ron_Ma.vcf）' : 'Download vCard (Yuan-Ron_Ma.vcf)',
        subtitle: isZh ? '匯入聯絡人至手機或郵件軟體' : 'Save contact details',
        meta: '.vcf',
        onSelect: () => {
          onDownloadVCard();
          onClose();
        },
      },
    ];

    const actionKeywords: Record<string, string[]> = {
      'act-theme': ['dark', 'light', 'theme', 'mode', 'night', 'day', '晝', '夜', '黑', '白', '深色', '淺色'],
      'act-lang': ['lang', 'language', 'en', 'zh', 'english', 'chinese', '中文', '英文', '語系'],
      'act-vcard': ['vcard', 'vcf', 'contact', '名片', '聯絡'],
    };

    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];
    const filteredActions = q
      ? actionItems.filter((a) => {
          const kws = actionKeywords[a.id] ?? [];
          const hay = `${a.title} ${a.subtitle ?? ''} ${kws.join(' ')}`.toLowerCase();
          return tokens.every((tok) => hay.includes(tok));
        })
      : actionItems;
    list.push(...filteredActions);

    return list;
  }, [
    query,
    publications,
    isZh,
    navText,
    theme,
    toggleTheme,
    setLang,
    onClose,
    onSelectPublication,
    onNavigateSection,
    onDownloadVCard,
  ]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const safeActiveIndex = items.length > 0 ? Math.min(activeIndex, items.length - 1) : 0;

  // 全域監聽 Escape 關閉，確保點擊非聚焦區域後按 ESC 依然生效
  useEffect(() => {
    if (!open) return;
    const onGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [open, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[safeActiveIndex]?.onSelect();
      }
    },
    [items, safeActiveIndex, onClose],
  );

  useEffect(() => {
    if (!open || !listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [safeActiveIndex, open]);

  const groupLabels: Record<PaletteItem['group'], string> = {
    publications: isZh
      ? query.trim()
        ? '匹配論文著作'
        : `近期著作（共 ${publications.length} 篇可檢索）`
      : query.trim()
        ? 'Matching Publications'
        : `Recent Works (${publications.length} searchable)`,
    sections: isZh ? '章節目錄' : 'Sections',
    actions: isZh ? '快速指令' : 'Quick Actions',
  };

  let lastGroup: PaletteItem['group'] | null = null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="editorial-cmd-palette"
          role="dialog"
          aria-modal="true"
          aria-label={isZh ? '學術檔案快速檢索' : 'Academic Archive Quick Search'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
          onClick={onClose}
          className="fixed inset-0 z-[100001] flex items-start justify-center bg-[color-mix(in_srgb,var(--app-bg)_82%,transparent)] px-4 pt-[12vh] backdrop-blur-sm"
        >
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: EDITORIAL_EASE }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="flex max-h-[72vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-[var(--app-rule)] bg-[var(--app-surface-card)] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.45)]"
          >
            {/* 頂部檢索列 */}
            <div className="flex items-center gap-3 border-b border-[var(--app-rule)] px-5 py-4">
              <Search className="h-4 w-4 shrink-0 text-[var(--app-muted)]" aria-hidden />
              <input
                ref={inputRef}
                id="cmdk-search-input"
                name="cmdk-search"
                type="search"
                role="combobox"
                aria-expanded={open}
                aria-controls="cmdk-listbox"
                aria-activedescendant={items[safeActiveIndex] ? `cmdk-opt-${items[safeActiveIndex].id}` : undefined}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isZh
                    ? `搜尋 ${publications.length} 篇論文標題、期刊、年份，或切換晝夜／章節…`
                    : `Search ${publications.length} papers, journals, years, or commands…`
                }
                aria-label={isZh ? '快速檢索關鍵字' : 'Quick search query'}
                className="w-full bg-transparent text-base text-[var(--app-ink)] placeholder:text-[var(--app-muted)] focus:outline-none focus-visible:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label={isZh ? '清除關鍵字' : 'Clear query'}
                  className="rounded-full p-1 text-[var(--app-muted)] transition-colors hover:text-[var(--app-ink)]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border border-[var(--app-rule)] px-3 py-1 font-mono text-xs text-[var(--app-muted)] transition-colors hover:border-[var(--app-ink)] hover:text-[var(--app-ink)]"
              >
                ESC
              </button>
            </div>

            {/* 檢索結果目錄 */}
            <div
              ref={listRef}
              id="cmdk-listbox"
              role="listbox"
              aria-label={isZh ? '快速檢索結果' : 'Quick search results'}
              className="min-h-0 flex-1 overflow-y-auto py-2"
            >
              {items.length === 0 ? (
                <div className="px-6 py-12 text-center text-base text-[var(--app-muted)]">
                  {isZh
                    ? '找不到相符的論文或指令，請嘗試其他材料或期刊關鍵字。'
                    : 'No matching publications or commands found.'}
                </div>
              ) : (
                items.map((item, idx) => {
                  const showHeader = item.group !== lastGroup;
                  lastGroup = item.group;
                  const isActive = idx === safeActiveIndex;

                  const Icon =
                    item.group === 'publications'
                      ? BookOpen
                      : item.group === 'sections'
                        ? ArrowDownRight
                        : item.id === 'act-theme'
                          ? theme === 'dark'
                            ? Sun
                            : Moon
                          : item.id === 'act-lang'
                            ? Languages
                            : Download;

                  return (
                    <React.Fragment key={item.id}>
                      {showHeader ? (
                        <div className="mt-2 border-t border-[var(--app-rule)] px-5 pb-1.5 pt-3 text-xs font-medium tracking-wide text-[var(--app-muted)] first:mt-0 first:border-t-0 first:pt-1.5">
                          {groupLabels[item.group]}
                        </div>
                      ) : null}
                      <button
                        id={`cmdk-opt-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        data-active={isActive ? 'true' : undefined}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={(e) => item.onSelect(e)}
                        className={`relative flex w-full items-start justify-between gap-4 px-5 py-3 text-left transition-colors ${
                          isActive
                            ? 'bg-[var(--app-hover)] text-[var(--app-ink)]'
                            : 'text-[var(--app-body)] hover:bg-[var(--app-hover)]'
                        }`}
                      >
                        {isActive ? (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 top-0 w-[2.5px] bg-[var(--app-accent)]"
                          />
                        ) : null}
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <Icon
                            className={`mt-1 h-4 w-4 shrink-0 ${
                              isActive ? 'text-[var(--app-accent)]' : 'text-[var(--app-muted)]'
                            }`}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <div
                              className={`truncate text-base ${
                                item.group === 'publications'
                                  ? 'font-sans font-semibold text-[var(--app-ink)]'
                                  : 'font-medium text-[var(--app-ink)]'
                              }`}
                            >
                              {item.title}
                            </div>
                            {item.subtitle ? (
                              <div
                                className={`mt-0.5 truncate text-sm text-[var(--app-muted)] ${
                                  item.group === 'publications' ? 'font-journal-italic' : ''
                                }`}
                              >
                                {item.subtitle}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {item.meta ? (
                          <span className="shrink-0 font-mono text-xs text-[var(--app-muted)] [font-variant-numeric:tabular-nums]">
                            {item.meta}
                          </span>
                        ) : null}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* 底部鍵盤操作提示尺規 */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-rule)] bg-[var(--app-hover)]/50 px-5 py-2.5 font-mono text-xs text-[var(--app-muted)]">
              <div className="flex items-center gap-4">
                <span>↑↓ {isZh ? '移動' : 'Navigate'}</span>
                <span className="inline-flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" aria-hidden />
                  {isZh ? '開啟' : 'Select'}
                </span>
              </div>
              <span>⌘K / Ctrl+K</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
