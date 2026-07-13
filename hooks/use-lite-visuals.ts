'use client';

import { useLayoutEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { detectIOS } from './use-is-ios';

const MOBILE_BREAKPOINT = 768;

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

function detectLiteVisuals(): boolean {
  if (typeof window === 'undefined') return true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;

  const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
  if (isMobile || detectIOS()) return true;

  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return true;
  const cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8;
  const mem = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8;
  if (cores <= 4 || mem <= 4) return true;

  return false;
}

/** Turn off GPU-heavy visuals on mobile, iOS WebKit, low-power, or reduced-motion. */
export function useLiteVisuals() {
  const prefersReducedMotion = useReducedMotion();
  const [lite, setLite] = useState(true);

  useLayoutEffect(() => {
    const update = () => setLite(detectLiteVisuals());
    update();

    const reducedMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    reducedMql.addEventListener('change', update);
    mobileMql.addEventListener('change', update);
    return () => {
      reducedMql.removeEventListener('change', update);
      mobileMql.removeEventListener('change', update);
    };
  }, []);

  return prefersReducedMotion === true || lite;
}
