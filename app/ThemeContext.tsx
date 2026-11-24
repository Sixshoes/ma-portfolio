'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export type ThemeMode = 'light' | 'dark';

type RippleOrigin = {
  clientX: number;
  clientY: number;
};

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (next: ThemeMode) => void;
  toggleTheme: (origin?: RippleOrigin) => void;
};

const STORAGE_KEY = 'ma-theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * 電致變色圓形光圈轉場（View Transitions API）：
 * 從點擊座標向外以 550ms 五次方減速曲線擴散渲染新主題；
 * 若瀏覽器不支援或使用者啟用減少動態效果，則安全降級為即時切換。
 */
export function toggleThemeWithRipple(
  origin: RippleOrigin | undefined,
  nextTheme: ThemeMode,
  applyTheme: (t: ThemeMode) => void,
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    applyTheme(nextTheme);
    return;
  }

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };

  if (!doc.startViewTransition || prefersReduce) {
    document.documentElement.dataset.theme = nextTheme;
    applyTheme(nextTheme);
    return;
  }

  const x = origin?.clientX ?? window.innerWidth - 64;
  const y = origin?.clientY ?? 32;
  // 放大 6% 確保圓形光圈完全覆蓋最遠左下角，杜絕收尾前露出白色三角殘影
  const maxRadius =
    Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) * 1.06;

  const transition = doc.startViewTransition(() => {
    document.documentElement.dataset.theme = nextTheme;
    flushSync(() => {
      applyTheme(nextTheme);
    });
  });

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 420,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'both',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    })
    .catch(() => {
      /* 忽略中斷的轉場動畫 */
    });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const domTheme = document.documentElement.dataset.theme;
    if (domTheme === 'dark' || domTheme === 'light') {
      setThemeState(domTheme);
      return;
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const initial: ThemeMode = saved === 'dark' ? 'dark' : 'light';
      document.documentElement.dataset.theme = initial;
      setThemeState(initial);
    } catch {
      document.documentElement.dataset.theme = 'light';
    }
  }, []);

  const persistTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = next;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore private browsing storage restrictions */
    }
  }, []);

  const toggleTheme = useCallback(
    (origin?: RippleOrigin) => {
      const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
      toggleThemeWithRipple(origin, next, persistTheme);
    },
    [theme, persistTheme],
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme: persistTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
