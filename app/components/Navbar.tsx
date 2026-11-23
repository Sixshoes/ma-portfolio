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

  // Scrollspy：動態量測各章節相對視窗頂端位置（相容 next/dynamic 延遲掛載區塊）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rafId = 0;

    const computeActive = () => {
      rafId = 0;
      const anchorY = 160;
      let current: SectionId | null = null;

      for (const id of SECTION_ORDER) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchorY) {
          current = id;
        }
      }

      // 頁面已捲至最底部時自動高亮最後一個區塊（聯絡資訊）
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
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
    const settleTimer = window.setTimeout(computeActive, 600);

    return () => {
      window.removeEventListener('scroll', scheduleCompute);
      window.removeEventListener('resize', scheduleCompute);
      window.clearTimeout(settleTimer);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
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
    'fixed left-0 top-0 z-50 w-full border-b border-[#e5dfd5] bg-[#faf8f4]/92 shadow-[0_2px_18px_rgba(20,19,17,0.04)] backdrop-blur-xl';

  const inner = (
    <>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-heading-serif text-xl font-semibold tracking-tight text-[#141311] transition-opacity hover:opacity-80 md:text-2xl"
        >
          <span className="italic text-[#8a6522]">Yuan-Ron</span>
          <span>Ma</span>
        </Link>
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="hidden items-center space-x-6 font-display text-xs font-medium uppercase tracking-[0.16em] text-[#57524b] lg:flex">
            <Link
              href="/"
              className="group relative transition-colors hover:text-[#141311]"
            >
              {navText.home}
              <span className="absolute -bottom-2 left-0 h-[1.5px] w-0 bg-[#9a742e] transition-all duration-300 group-hover:w-full" />
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
                    isActive ? 'font-semibold text-[#141311]' : 'text-[#57524b] hover:text-[#141311]'
                  }`}
                >
                  {navText[item]}
                  <span
                    className={`absolute -bottom-2 left-0 h-[1.5px] bg-[#9a742e] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher
              layoutId="hetero-main-nav"
              className="[&_button]:px-3 [&_button]:py-1 [&_button]:text-[11px] md:[&_button]:px-3.5 md:[&_button]:text-xs"
            />
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              className="rounded-lg p-2 text-[#292622] transition-colors hover:bg-[#efeae0] lg:hidden"
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
            className="overflow-hidden border-b border-[#e5dfd5] bg-[#faf8f4] lg:hidden"
          >
            <div className="flex flex-col space-y-2 p-6 font-display text-xs font-medium uppercase tracking-[0.16em] text-[#57524b]">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="py-2 transition-colors hover:text-[#141311]"
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
                      isActive ? 'font-semibold text-[#8a6522]' : 'text-[#57524b] hover:text-[#141311]'
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
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={navClassName}
    >
      {inner}
    </motion.nav>
  );
}
