'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, Menu } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import type { NavText } from '@/lib/i18n';

type NavbarProps = {
  navText: NavText;
  isMobile?: boolean;
};

/** 依頁面由上而下的實際區塊順序排列 */
const SECTION_ORDER = ['research', 'publications', 'about', 'impact', 'contact'] as const;
type SectionId = (typeof SECTION_ORDER)[number];

export function Navbar({ navText, isMobile = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const lenis = useLenis();

  // Scrollspy：追蹤目前可視區所在的章節並高亮導覽列項目
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const elements = SECTION_ORDER.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (elements.length === 0) return;

    const visibleMap = new Map<SectionId, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          if (entry.isIntersecting) {
            visibleMap.set(id, entry.intersectionRatio);
          } else {
            visibleMap.delete(id);
          }
        }

        if (visibleMap.size === 0) {
          if (window.scrollY < 240) setActiveSection(null);
          return;
        }

        // 依頁面順序選最接近上方可視區的章節
        for (const id of SECTION_ORDER) {
          if (visibleMap.has(id)) {
            setActiveSection(id);
            return;
          }
        }
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: [0, 0.1, 0.25],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setIsMenuOpen(false);
      setActiveSection(id);

      if (lenis && !isMobile) {
        lenis.scrollTo(target, { offset: -76, duration: 0.9 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.history.replaceState(null, '', `#${id}`);
    },
    [lenis, isMobile],
  );

  const navClassName =
    'fixed left-0 top-0 z-50 w-full border-b border-stone-800/70 bg-[#121110]/95 shadow-[0_8px_30px_rgba(0,0,0,0.38)] md:bg-[#121110]/85 md:backdrop-blur-xl';

  const inner = (
    <>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-bold tracking-[0.14em] text-stone-100 transition-transform hover:scale-[1.02] md:text-xl md:tracking-[0.18em]"
        >
          <span className="text-[#d4af37]">Yuan-Ron</span> Ma
        </Link>
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="hidden items-center space-x-6 font-display text-xs uppercase tracking-[0.18em] text-stone-300 lg:flex">
            <Link
              href="/"
              className="group relative text-stone-300 transition-all hover:-translate-y-0.5 hover:text-[#e8dcc4]"
            >
              {navText.home}
              <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-[#c4a77d]/80 transition-all duration-300 group-hover:w-full" />
            </Link>
            {SECTION_ORDER.map((item) => {
              const isActive = activeSection === item;
              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleAnchorClick(e, item)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`group relative transition-colors ${
                    isActive ? 'text-[#e8dcc4]' : 'text-stone-300 hover:text-[#e8dcc4]'
                  }`}
                >
                  {navText[item]}
                  <span
                    className={`absolute -bottom-2 left-0 h-[1.5px] bg-[#d4af37] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher
              layoutId="hetero-main-nav"
              className="[&_button]:px-3 [&_button]:py-1.5 [&_button]:text-[11px] md:[&_button]:px-4 md:[&_button]:text-sm"
            />
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              className="p-2 text-stone-300 transition-colors hover:text-[#e8dcc4] lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-stone-800/70 bg-[#121110]/98 lg:hidden"
          >
            <div className="flex flex-col space-y-3 p-6 font-display text-xs uppercase tracking-[0.18em] text-stone-300">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="py-2 transition-colors hover:text-[#e8dcc4]"
              >
                {navText.home}
              </Link>
              {SECTION_ORDER.map((item) => {
                const isActive = activeSection === item;
                return (
                  <a
                    key={item}
                    href={`#${item}`}
                    onClick={(e) => handleAnchorClick(e, item)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`py-2 transition-colors ${
                      isActive ? 'font-semibold text-[#e8dcc4]' : 'text-stone-300 hover:text-[#e8dcc4]'
                    }`}
                  >
                    {navText[item]}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (isMobile) {
    return <nav className={navClassName}>{inner}</nav>;
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={navClassName}
    >
      {inner}
    </motion.nav>
  );
}
