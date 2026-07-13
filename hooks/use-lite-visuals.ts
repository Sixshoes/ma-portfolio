'use client';

import { useReducedMotion } from 'motion/react';
import { useIsMobile } from './use-mobile';
import { useIsIOS } from './use-is-ios';
import { useLowPowerMode } from './use-low-power-mode';

/** Turn off GPU-heavy visuals on mobile, iOS WebKit, low-power, or reduced-motion. */
export function useLiteVisuals() {
  const isMobile = useIsMobile();
  const isIOS = useIsIOS();
  const isLowPowerMode = useLowPowerMode();
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion === true || isLowPowerMode || isMobile || isIOS;
}
