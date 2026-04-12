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
      className={`flex items-center rounded-full border border-stone-700/50 bg-stone-900/60 p-1 shadow-[0_6px_22px_rgba(0,0,0,0.28)] backdrop-blur-md ${className}`}
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
            className="relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a77d]/50"
          >
            {active ? (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 z-0 rounded-full bg-gradient-to-tr from-[#9a8260] to-[#c4a77d]"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8,
                }}
                initial={{ boxShadow: '0px 0px 0px rgba(196,167,125,0)' }}
                animate={{ boxShadow: '0px 0px 15px rgba(196,167,125,0.4)' }}
              />
            ) : null}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                active ? 'font-bold text-stone-950' : 'text-stone-400 hover:text-stone-200'
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
