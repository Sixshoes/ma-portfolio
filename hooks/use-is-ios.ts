'use client';

import { useSyncExternalStore } from 'react';

export function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

const subscribeNoop = () => () => {};

/** iOS WebKit (Safari, Messenger/LINE in-app browser, etc.) struggles with blur / blend / heavy rAF. */
export function useIsIOS(): boolean {
  return useSyncExternalStore(subscribeNoop, detectIOS, () => true);
}
