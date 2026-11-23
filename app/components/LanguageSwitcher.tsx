'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/app/LanguageContext';

type LangCode = 'zh' | 'en';

const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
];

type LanguageSwitcherProps = {
  /** 不同頁面請用不同 id，避免跨路由 layout 動畫殘影 */
  layoutId?: string;
  className?: string;
};

export function LanguageSwitcher({
  layoutId = 'heterojunction-electron',
  className = '',
}: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`flex items-center rounded-full border border-[#dcd4c7] bg-[#f3efe7]/90 p-1 shadow-[0_2px_10px_rgba(20,19,17,0.05)] backdrop-blur-md ${className}`}
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map(({ code, label }) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            className="relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9a742e]/60 md:text-sm"
          >
            {active ? (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 z-0 rounded-full bg-[#181614]"
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 30,
                  mass: 0.8,
                }}
              />
            ) : null}
            <span
              className={`relative z-10 transition-colors duration-200 ${
                active ? 'font-semibold text-[#faf8f4]' : 'text-[#57524b] hover:text-[#141311]'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
