'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { X, Menu } from 'lucide-react';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import type { NavText } from '@/lib/i18n';

type NavbarProps = {
  navText: NavText;
  lang: 'en' | 'zh';
};

const SECTION_ORDER = ['research', 'publications', 'about', 'impact', 'contact'] as const;
type SectionId = (typeof SECTION_ORDER)[number];

export function Navbar({ navText, lang }: NavbarProps) {
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

  const brandName = lang === 'zh' ? '馬遠榮' : 'Prof. Yuan-Ron Ma';

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#D4D1C8] bg-[#F7F6F2]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          onClick={handleScrollTop}
          className="font-editorial text-lg font-semibold tracking-tight text-[#141413] transition-colors hover:text-[#1B365D] md:text-xl"
        >
          {brandName}
        </a>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="hidden items-center space-x-6 text-sm font-normal text-[#5C5953] lg:flex">
            <a
              href="#top"
              onClick={handleScrollTop}
              className={`border-b-2 py-0.5 transition-colors ${
                activeSection === null
                  ? 'border-[#141413] font-medium text-[#141413]'
                  : 'border-transparent hover:text-[#141413]'
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
                      ? 'border-[#141413] font-medium text-[#141413]'
                      : 'border-transparent text-[#5C5953] hover:text-[#141413]'
                  }`}
                >
                  {navText[item]}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-menu"
              className="rounded-none p-1.5 text-[#141413] transition-colors hover:bg-[#EFECE6] lg:hidden"
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
          className="border-t border-[#D4D1C8] bg-[#F7F6F2] lg:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col divide-y divide-[#D4D1C8] px-6 py-2 text-sm text-[#2D2C29]">
            <a
              href="#top"
              onClick={handleScrollTop}
              className="py-3 transition-colors hover:text-[#1B365D]"
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
                    isActive ? 'font-semibold text-[#141413]' : 'text-[#5C5953] hover:text-[#141413]'
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
