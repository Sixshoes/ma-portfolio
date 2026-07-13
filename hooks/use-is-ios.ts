'use client';

import { useEffect, useState } from 'react';

export function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** iOS WebKit (Safari, Messenger/LINE in-app browser, etc.) struggles with blur / blend / heavy rAF. */
export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(true);

  useEffect(() => {
    setIsIOS(detectIOS());
  }, []);

  return isIOS;
}
