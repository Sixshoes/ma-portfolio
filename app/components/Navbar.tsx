'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { X, Menu } from 'lucide-react';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import type { NavText } from '@/lib/i18n';

type NavbarProps = {
  navText: NavText;
};

const SECTION_ORDER = ['research', 'publications', 'about', 'impact', 'contact'] as const;
type SectionId = (typeof SECTION_ORDER)[number];

export function Navbar({ navText }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

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

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#DCE2E8] bg-[#F6F7F8]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <a
          href="#top"
          onClick={handleScrollTop}
          className="flex items-baseline gap-1.5 text-base font-semibold tracking-tight text-[#11161C] transition-colors hover:text-[#0F4C81] md:text-lg"
        >
          <span>Yuan-Ron Ma</span>
          <span className="hidden font-mono text-[11px] font-normal text-[#5A6775] sm:inline">
            / FGU · NDHU
          </span>
        </a>

        <div className="flex items-center gap-4 lg:gap-7">
          <div className="hidden items-center space-x-6 text-xs font-medium tracking-[0.04em] text-[#5A6775] lg:flex">
            <a
              href="#top"
              onClick={handleScrollTop}
              className={`relative py-1 transition-colors ${
                activeSection === null ? 'text-[#0F4C81]' : 'hover:text-[#11161C]'
              }`}
            >
              {navText.home}
              <span
                className={`absolute -bottom-[15px] left-0 h-[2px] bg-[#0F4C81] transition-all duration-150 ${
                  activeSection === null ? 'w-full' : 'w-0'
                }`}
              />
            </a>
            {SECTION_ORDER.map((item) => {
              const isActive = activeSection === item;
              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleAnchorClick(e, item)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`relative py-1 transition-colors ${
                    isActive ? 'font-semibold text-[#0F4C81]' : 'text-[#5A6775] hover:text-[#11161C]'
                  }`}
                >
                  {navText[item]}
                  <span
                    className={`absolute -bottom-[15px] left-0 h-[2px] bg-[#0F4C81] transition-all duration-150 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              className="rounded-md border border-transparent p-2 text-[#11161C] transition-colors hover:border-[#DCE2E8] hover:bg-white lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          id="mobile-nav-menu"
          className="border-t border-[#DCE2E8] bg-white lg:hidden"
        >
          <div className="flex flex-col space-y-1 px-6 py-4 text-sm font-medium text-[#2B3642]">
            <a
              href="#top"
              onClick={handleScrollTop}
              className="rounded-md px-2 py-2 transition-colors hover:bg-[#F6F7F8] hover:text-[#0F4C81]"
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
                  className={`rounded-md px-2 py-2 transition-colors ${
                    isActive
                      ? 'bg-[#EBF2F8] font-semibold text-[#0F4C81]'
                      : 'text-[#2B3642] hover:bg-[#F6F7F8] hover:text-[#11161C]'
                  }`}
                >
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
