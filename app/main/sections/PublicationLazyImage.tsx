'use client';

import React, { useState } from 'react';

type PublicationLazyImageProps = {
  src: string;
  alt: string;
  eager?: boolean;
  className?: string;
  /** 圖片載入失敗或為 1x1 追蹤圖時通知父元件收合整個圖片欄 */
  onUnavailable?: () => void;
};

/**
 * 零破圖論文摘要圖元件：
 * - 一律帶 referrerPolicy="no-referrer"
 * - 失敗或 naturalWidth / naturalHeight <= 16（攔截 1x1 像素或空回應）立即回傳 null 並通知父元件收合圖片欄
 */
export function PublicationLazyImage({
  src,
  alt,
  eager = false,
  className = 'h-full w-full object-contain',
  onUnavailable,
}: PublicationLazyImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return null;

  const markFailed = () => {
    setFailed(true);
    onUnavailable?.();
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={markFailed}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth <= 16 || e.currentTarget.naturalHeight <= 16) {
          markFailed();
        }
      }}
      className={className}
    />
  );
}
