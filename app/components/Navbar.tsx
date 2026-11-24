'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { EDITORIAL_EASE } from '@/app/components/EditorialMotion';
import { useTheme } from '@/app/ThemeContext';
import type { NavText } from '@/lib/i18n';

type NavbarProps = {
  navText: NavText;
  lang: 'en' | 'zh';
  onOpenCommandPalette: () => void;
};

const SECTION_ORDER = ['research', 'publications', 'about', 'impact', 'contact'] as const;
type SectionId = (typeof SECTION_ORDER)[number];

const SECTION_NUMBERS: Record<SectionId, string> = {
  research: '01',
  publications: '02',
  about: '03',
  impact: '04',
  contact: '05',
};

export function Navbar({ navText, lang, onOpenCommandPalette }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rafId = 0;

    const computeActive = () => {
      rafId = 0;
      const anchorY = 140;
      let current: SectionId | null = null;

      for (const id of SECTION_ORDER) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchorY) {
          current = id;
        }
      }

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120;
      if (nearBottom) {
        current = SECTION_ORDER[SECTION_ORDER.length - 1];
      }

      setActiveSection((prev) => (prev === current ? prev : current));
    };

    const scheduleCompute = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(computeActive);
    };

    computeActive();
    window.addEventListener('scroll', scheduleCompute, { passive: true });
    window.addEventListener('resize', scheduleCompute, { passive: true });
    const settleTimer = window.setTimeout(computeActive, 500);

    return () => {
      window.removeEventListener('scroll', scheduleCompute);
      window.removeEventListener('resize', scheduleCompute);
      window.clearTimeout(settleTimer);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleScrollTop = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setActiveSection(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash) {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setIsMenuOpen(false);
      setActiveSection(id);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    },
    [],
  );

  const handleThemeToggleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      toggleTheme({ clientX: e.clientX, clientY: e.clientY });
    },
    [toggleTheme],
  );

  const isZh = lang === 'zh';
  const brandName = isZh ? '馬遠榮' : 'Prof. Yuan-Ron Ma';
  const isDark = theme === 'dark';

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-[var(--app-rule)] bg-[color-mix(in_srgb,var(--app-bg)_92%,transparent)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 items-baseline gap-2.5">
          <a
            href="#top"
            onClick={handleScrollTop}
            className="font-editorial shrink-0 text-lg font-semibold tracking-tight text-[var(--app-ink)] transition-colors hover:text-[var(--app-accent)] md:text-xl"
          >
            {brandName}
          </a>

          {/* 捲過首屏後動態淡入之期刊章節小頁眉（例：· § 02 發表著作） */}
          <div className="hidden min-w-0 overflow-hidden sm:flex sm:items-baseline">
            <AnimatePresence mode="wait" initial={false}>
              {activeSection ? (
                <motion.span
                  key={`${lang}-${activeSection}`}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, ease: EDITORIAL_EASE }}
                  className="inline-flex items-baseline gap-1.5 truncate text-xs text-[var(--app-muted)]"
                >
                  <span aria-hidden="true" className="text-[var(--app-rule)]">
                    ·
                  </span>
                  <span className="font-mono text-[11px] font-medium text-[var(--app-accent)] [font-variant-numeric:tabular-nums]">
                    § {SECTION_NUMBERS[activeSection]}
                  </span>
                  <span className="truncate text-[var(--app-body)]">{navText[activeSection]}</span>
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden items-center space-x-5 text-sm font-normal text-[var(--app-muted)] lg:flex">
            <a
              href="#top"
              onClick={handleScrollTop}
              className={`border-b-2 py-0.5 transition-colors ${
                activeSection === null
                  ? 'border-[var(--app-ink)] font-medium text-[var(--app-ink)]'
                  : 'border-transparent hover:text-[var(--app-ink)]'
              }`}
            >
              {navText.home}
            </a>
            {SECTION_ORDER.map((item) => {
              const isActive = activeSection === item;
              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleAnchorClick(e, item)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`border-b-2 py-0.5 transition-colors ${
                    isActive
                      ? 'border-[var(--app-ink)] font-medium text-[var(--app-ink)]'
                      : 'border-transparent text-[var(--app-muted)] hover:text-[var(--app-ink)]'
                  }`}
                >
                  {navText[item]}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* ⌘K 快速檢索觸發鈕（柔和膠囊） */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label={isZh ? '開啟快速檢索（⌘K）' : 'Open quick search (⌘K)'}
              title={isZh ? '快速檢索論文與指令（⌘K / Ctrl+K）' : 'Quick search (⌘K / Ctrl+K)'}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-rule)] bg-[var(--app-surface-card)]/80 px-3 py-1 text-xs text-[var(--app-muted)] transition-colors hover:border-[var(--app-ink)] hover:bg-[var(--app-hover)] hover:text-[var(--app-ink)]"
            >
              <Search className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden font-mono text-[11px] sm:inline">⌘K</span>
            </button>

            {/* 電致變色晝／夜雙版切換鈕（柔和膠囊） */}
            <button
              type="button"
              onClick={handleThemeToggleClick}
              aria-label={
                isDark
                  ? isZh
                    ? '切換為晝讀紙本白版'
                    : 'Switch to light paper theme'
                  : isZh
                    ? '切換為夜讀典藏黑版'
                    : 'Switch to archival dark theme'
              }
              title={
                isDark
                  ? isZh
                    ? '切換為晝讀紙本白版'
                    : 'Switch to light theme'
                  : isZh
                    ? '切換為夜讀典藏黑版'
                    : 'Switch to dark theme'
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-rule)] bg-[var(--app-surface-card)]/80 px-3 py-1 text-xs text-[var(--app-ink)] transition-colors hover:border-[var(--app-ink)] hover:bg-[var(--app-hover)]"
            >
              {isDark ? (
                <Sun className="h-3.5 w-3.5 text-[var(--app-accent)]" aria-hidden />
              ) : (
                <Moon className="h-3.5 w-3.5 text-[var(--app-accent)]" aria-hidden />
              )}
              <span className="hidden font-editorial text-xs font-medium sm:inline">
                {isDark ? (isZh ? '晝' : 'Day') : isZh ? '夜' : 'Night'}
              </span>
            </button>

            <LanguageSwitcher />

            <button
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              className="rounded-full p-1.5 text-[var(--app-ink)] transition-colors hover:bg-[var(--app-hover)] lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* 頂部 1.5px 墨水閱讀進度條 */}
      <motion.div
        aria-hidden="true"
        style={{
          scaleX: reduceMotion ? scrollYProgress : smoothProgress,
          transformOrigin: 'left',
        }}
        className="pointer-events-none absolute bottom-0 left-0 h-[1.5px] w-full bg-[var(--app-accent)] will-change-transform"
      />

      {isMenuOpen ? (
        <div
          id="mobile-nav-menu"
          className="border-t border-[var(--app-rule)] bg-[var(--app-bg)] lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col divide-y divide-[var(--app-rule)] px-6 py-2 text-sm text-[var(--app-body)]">
            <a
              href="#top"
              onClick={handleScrollTop}
              className="py-3 transition-colors hover:text-[var(--app-accent)]"
            >
              {navText.home}
            </a>
            {SECTION_ORDER.map((item) => {
              const isActive = activeSection === item;
              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleAnchorClick(e, item)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`py-3 transition-colors ${
                    isActive
                      ? 'font-semibold text-[var(--app-ink)]'
                      : 'text-[var(--app-muted)] hover:text-[var(--app-ink)]'
                  }`}
                >
                  <span className="mr-2 font-mono text-xs text-[var(--app-accent)]">
                    § {SECTION_NUMBERS[item]}
                  </span>
                  {navText[item]}
                </a>
              );
            })}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
