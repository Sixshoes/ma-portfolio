'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, Menu } from 'lucide-react';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import type { NavText } from '@/lib/i18n';

type NavbarProps = {
  navText: NavText;
  isMobile?: boolean;
};

export function Navbar({ navText, isMobile = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navClassName =
    'fixed left-0 top-0 z-50 w-full border-b border-white/[0.06] bg-[#0c0a09]/95 shadow-[0_8px_30px_rgba(0,0,0,0.35)] md:bg-[#0c0a09]/82 md:backdrop-blur-xl';

  const inner = (
    <>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex cursor-pointer items-center gap-2 font-display text-xl font-bold tracking-[0.15em] text-stone-100 transition-transform hover:scale-[1.02] md:tracking-[0.2em]">
          <span className="text-[#c4a77d]">Yuan-Ron</span> Ma
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden space-x-8 font-display text-xs uppercase tracking-[0.2em] text-stone-500 md:flex">
            <motion.a
              href="/"
              whileHover={{ y: -2, color: '#d4c4a8' }}
              className="group relative text-stone-400 transition-colors"
            >
              {navText.home}
              <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-[#b08d52]/80 transition-all duration-300 group-hover:w-full" />
            </motion.a>
            {(['about', 'research', 'publications', 'contact'] as const).map((item) => (
              <motion.a
                key={item}
                href={`#${item}`}
                whileHover={{ y: -2, color: '#e8dcc4' }}
                className="group relative transition-colors"
              >
                {navText[item]}
                <span className="absolute -bottom-2 left-0 h-[1px] w-0 bg-[#b08d52]/70 transition-all duration-300 group-hover:w-full" />
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher
              layoutId="hetero-main-nav"
              className="[&_button]:px-3 [&_button]:py-1.5 [&_button]:text-[11px] md:[&_button]:px-4 md:[&_button]:text-sm"
            />
            <button
              type="button"
              className="p-2 text-stone-400 transition-colors hover:text-[#d4c4a8] md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-white/[0.06] bg-[#0c0a09]/98 md:hidden"
          >
            <div className="flex flex-col space-y-4 p-6 font-display text-xs uppercase tracking-[0.2em] text-stone-500">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="py-2 transition-colors hover:text-[#d4c4a8]"
              >
                {navText.home}
              </Link>
              {(['about', 'research', 'publications', 'contact'] as const).map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 transition-colors hover:text-[#e8dcc4]"
                >
                  {navText[item]}
                </a>
              ))}
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
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={navClassName}
    >
      {inner}
    </motion.nav>
  );
}
