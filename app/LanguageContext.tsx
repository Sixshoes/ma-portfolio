'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLiteVisuals } from '@/hooks/use-lite-visuals';

type Lang = 'en' | 'zh';

const LANG_STORAGE_KEY = 'preferred_lang';
const LANG_CHANGE_EVENT = 'preferred-lang-change';
let memoryLang: Lang | null = null;

function detectDefaultLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const candidates =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  const hasZh = candidates.some((code) => (code || '').toLowerCase().startsWith('zh'));
  return hasZh ? 'zh' : 'en';
}

function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
    if (saved === 'en' || saved === 'zh') {
      memoryLang = saved;
      return saved;
    }
  } catch {
    /* localStorage unavailable */
  }
  return memoryLang ?? detectDefaultLang();
}

function subscribeLang(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === LANG_STORAGE_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(LANG_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(LANG_CHANGE_EVENT, onStoreChange);
  };
}

function persistLang(lang: Lang) {
  memoryLang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore storage restrictions; memoryLang keeps session state */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
  }
}

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  isTransitioning: false,
});

const SWAP_MS = 75;
const CLEAR_MS = 180;

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const lang = useSyncExternalStore(subscribeLang, readStoredLang, (): Lang => 'en');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const swapTimerRef = useRef<number | null>(null);
  const clearTimerRef = useRef<number | null>(null);
  const liteVisuals = useLiteVisuals();
  const prefersReducedMotion = useReducedMotion() === true;
  const skipTransition = prefersReducedMotion || liteVisuals;

  // 同步更新 <html lang="..."> 以利無障礙與搜尋引擎辨識語系
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant-TW' : 'en';
  }, [lang]);

  useEffect(() => {
    return () => {
      if (swapTimerRef.current !== null) window.clearTimeout(swapTimerRef.current);
      if (clearTimerRef.current !== null) window.clearTimeout(clearTimerRef.current);
    };
  }, []);

  const setLang = useCallback(
    (newLang: Lang) => {
      if (swapTimerRef.current !== null) {
        window.clearTimeout(swapTimerRef.current);
        swapTimerRef.current = null;
      }
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
      if (newLang === lang) {
        setIsTransitioning(false);
        return;
      }
      if (skipTransition) {
        persistLang(newLang);
        return;
      }
      setIsTransitioning(true);
      swapTimerRef.current = window.setTimeout(() => persistLang(newLang), SWAP_MS);
      clearTimerRef.current = window.setTimeout(() => setIsTransitioning(false), CLEAR_MS);
    },
    [lang, skipTransition],
  );

  const contextValue = useMemo(
    () => ({ lang, setLang, isTransitioning }),
    [lang, setLang, isTransitioning],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      <motion.div
        animate={{
          opacity: isTransitioning && !skipTransition ? 0.85 : 1,
        }}
        transition={{
          duration: 0.16,
          ease: 'easeOut',
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
