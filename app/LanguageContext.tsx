'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'en' | 'zh';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_lang') as Lang;
    if (savedLang === 'en' || savedLang === 'zh') {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('preferred_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
