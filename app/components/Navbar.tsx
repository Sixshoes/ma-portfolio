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

const SECTION_ORDER = ['research', 'publications', 'about', 'impact', 'contact'] as const;
type SectionId = (typeof SECTION_ORDER)[number];

export function Navbar({ navText, isMobile = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const lenis = useLenis();

  // 動態捲動量測（相容 next/dynamic 區塊且絕不出現雙底線）
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
        lenis.scrollTo(target, { offset: -72, duration: 0.85 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.history.replaceState(null, '', `#${id}`);
    },
    [lenis, isMobile],
  );

  const navClassName =
    'fixed left-0 top-0 z-50 w-full border-b border-white/[0.08] bg-[#080807]/84 backdrop-blur-xl';

  const inner = (
    <>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:py-4">
        <Link
          href="/"
          className="flex items-baseline gap-1.5 font-heading-serif text-xl font-semibold tracking-tight text-[#f5f3ef] transition-opacity hover:opacity-80 md:text-2xl"
        >
          <span className="font-normal italic text-[#e2c992]">Yuan-Ron</span>
          <span>Ma</span>
        </Link>

        <div className="flex items-center gap-4 lg:gap-8">
          <div className="hidden items-center space-x-7 font-display text-[11px] font-medium uppercase tracking-[0.2em] text-[#9b958c] lg:flex">
            <Link href="/" className="group relative transition-colors hover:text-[#f5f3ef]">
              {navText.home}
              <span className="absolute -bottom-2 left-0 h-px w-0 bg-[#c8a464] transition-all duration-300 group-hover:w-full" />
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
                    isActive ? 'text-[#f5f3ef]' : 'text-[#9b958c] hover:text-[#f5f3ef]'
                  }`}
                >
                  {navText[item]}
                  <span
                    className={`absolute -bottom-2 left-0 h-px bg-[#c8a464] transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher layoutId="hetero-main-nav" />
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              className="rounded-lg p-2 text-[#e8e4dc] transition-colors hover:bg-white/[0.06] lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
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
            className="overflow-hidden border-b border-white/[0.08] bg-[#0a0a09] lg:hidden"
          >
            <div className="flex flex-col space-y-2 p-6 font-display text-xs uppercase tracking-[0.2em] text-[#9b958c]">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="py-2 transition-colors hover:text-[#f5f3ef]"
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
                      isActive ? 'text-[#e2c992]' : 'text-[#9b958c] hover:text-[#f5f3ef]'
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
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={navClassName}
    >
      {inner}
    </motion.nav>
  );
}
