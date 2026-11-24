'use client';

import React from 'react';
import { useLanguage } from '@/app/LanguageContext';

type LangCode = 'zh' | 'en';

type LanguageSwitcherProps = {
  className?: string;
};

/** 純文字書卷語系切換（中文 / EN）：啟用項加墨黑底線，零膠囊圓角 */
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
            ? 'border-b-2 border-[#141413] font-semibold text-[#141413]'
            : 'border-b-2 border-transparent text-[#5C5953] hover:text-[#141413]'
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
      <span aria-hidden="true" className="text-xs text-[#D4D1C8]">
        /
      </span>
      {renderBtn('en', 'EN')}
    </div>
  );
}
