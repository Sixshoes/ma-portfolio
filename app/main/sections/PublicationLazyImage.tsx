'use client';

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { PublicationFigurePlaceholder } from './PublicationFigurePlaceholder';

type PublicationLazyImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  /** 主圖載入失敗時的二次備援（例如期刊封面 file_img） */
  fallbackSrc?: string | null;
  eager: boolean;
};

export function PublicationLazyImage({
  eager,
  src,
  fallbackSrc,
  alt,
  fill,
  className,
  sizes,
  priority,
  ...rest
}: PublicationLazyImageProps) {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'error'>('primary');

  const hasFallback = Boolean(fallbackSrc && fallbackSrc !== src);
  const activeSrc =
    stage === 'primary' ? src : stage === 'fallback' && hasFallback ? fallbackSrc! : '';

  if (stage === 'error' || !activeSrc) {
    return <PublicationFigurePlaceholder />;
  }

  const isExternal = activeSrc.startsWith('http');

  const handleError = () => {
    if (stage === 'primary' && hasFallback) {
      setStage('fallback');
    } else {
      setStage('error');
    }
  };

  return (
    <div className={fill ? 'absolute inset-0' : 'relative size-full min-h-0'}>
      <Image
        key={activeSrc}
        src={activeSrc}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={eager || priority}
        loading={eager || priority ? 'eager' : 'lazy'}
        decoding="async"
        unoptimized={isExternal}
        onError={handleError}
        {...rest}
      />
    </div>
  );
}
