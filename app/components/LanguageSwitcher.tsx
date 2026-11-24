'use client';

import React from 'react';
import { useLanguage } from '@/app/LanguageContext';

type LangCode = 'zh' | 'en';

type LanguageSwitcherProps = {
  className?: string;
};

/** 純文字書卷語系切換（中文 / EN）：啟用項加墨色底線，零膠囊圓角 */
export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();

  const renderBtn = (code: LangCode, label: string) => {
    const active = lang === code;
    return (
      <button
        key={code}
        type="button"
        onClick={() => setLang(code)}
        aria-pressed={active}
        className={`pb-0.5 text-sm transition-colors duration-150 ${
          active
            ? 'border-b-2 border-[var(--app-ink)] font-semibold text-[var(--app-ink)]'
            : 'border-b-2 border-transparent text-[var(--app-muted)] hover:text-[var(--app-ink)]'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="group"
      aria-label="Language"
    >
      {renderBtn('zh', '中文')}
      <span aria-hidden="true" className="text-xs text-[var(--app-rule)]">
        /
      </span>
      {renderBtn('en', 'EN')}
    </div>
  );
}
