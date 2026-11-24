'use client';

import React from 'react';
import { useLanguage } from '@/app/LanguageContext';

type LangCode = 'zh' | 'en';

const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
];

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-md border border-[#DCE2E8] bg-[#EEF1F5] p-0.5 ${className}`}
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
            aria-pressed={active}
            className={`rounded-[5px] px-2.5 py-1 font-mono text-xs transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F4C81] ${
              active
                ? 'bg-[#0F4C81] font-semibold text-white'
                : 'text-[#5A6775] hover:text-[#11161C]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
