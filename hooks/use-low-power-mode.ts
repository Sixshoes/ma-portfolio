'use client';

import { useEffect, useState } from 'react';

type NavigatorWithHints = Navigator & {
  connection?: {
    saveData?: boolean;
  };
  deviceMemory?: number;
};

export function useLowPowerMode() {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithHints;
    const saveData = Boolean(nav.connection?.saveData);
    const cpuCores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : 8;
    const deviceMemory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : 8;

    setIsLowPowerMode(saveData || cpuCores <= 4 || deviceMemory <= 4);
  }, []);

  return isLowPowerMode;
}
