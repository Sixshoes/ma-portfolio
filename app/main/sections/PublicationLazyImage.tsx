'use client';

import React, { useEffect, useRef, useState } from 'react';

type PublicationLazyImageProps = {
  src: string;
  alt: string;
  eager?: boolean;
  className?: string;
  /** 圖片完成載入且寬高有效時通知父元件顯現白色相紙外框 */
  onLoaded?: () => void;
  /** 圖片載入失敗或為 1x1 追蹤圖時通知父元件收合整個圖片欄 */
  onUnavailable?: () => void;
};

/**
 * 零破圖／零空白框論文摘要圖元件：
 * - 一律帶 referrerPolicy="no-referrer"
 * - 失敗或 naturalWidth / naturalHeight <= 16（攔截 1x1 像素或空回應）立即回傳 null 並通知父元件收合圖片欄
 * - 載入完成前隱藏白框避免快速捲動時閃出空白方框，已快取圖片於掛載瞬間即時顯現
 */
export function PublicationLazyImage({
  src,
  alt,
  eager = false,
  className = 'h-full w-full object-contain',
  onLoaded,
  onUnavailable,
}: PublicationLazyImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src && failedSrc === src);

  const markFailed = () => {
    setFailedSrc(src);
    onUnavailable?.();
  };

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !src) return;
    if (img.complete) {
      if (img.naturalWidth > 16 && img.naturalHeight > 16) {
        onLoaded?.();
      } else {
        setFailedSrc(src);
        onUnavailable?.();
      }
    }
  }, [src, onLoaded, onUnavailable]);

  if (!src || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={markFailed}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth <= 16 || e.currentTarget.naturalHeight <= 16) {
          markFailed();
        } else {
          onLoaded?.();
        }
      }}
      className={className}
    />
  );
}
