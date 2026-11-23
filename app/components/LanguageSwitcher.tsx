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
      className={`inline-flex items-center rounded-lg border border-white/[0.12] bg-white/[0.03] p-0.5 backdrop-blur-md ${className}`}
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
            className="relative rounded-md px-3 py-1 font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c8a464]"
          >
            {active ? (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 z-0 rounded-md bg-[#f5f3ef]"
                transition={{
                  type: 'spring',
                  stiffness: 460,
                  damping: 32,
                  mass: 0.75,
                }}
              />
            ) : null}
            <span
              className={`relative z-10 transition-colors duration-200 ${
                active ? 'font-semibold text-[#080807]' : 'text-[#9b958c] hover:text-[#f5f3ef]'
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
