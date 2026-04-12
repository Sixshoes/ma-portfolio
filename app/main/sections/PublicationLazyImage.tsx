'use client';

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { PublicationFigurePlaceholder } from './PublicationFigurePlaceholder';

type PublicationLazyImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  eager: boolean;
};

export function PublicationLazyImage({
  eager,
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  ...rest
}: PublicationLazyImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return <PublicationFigurePlaceholder />;
  }

  const isExternal = src.startsWith('http');

  return (
    <div className={fill ? 'absolute inset-0' : 'relative size-full min-h-0'}>
      <Image
        key={src}
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={eager || priority}
        loading={eager || priority ? 'eager' : 'lazy'}
        decoding="async"
        unoptimized={isExternal}
        onError={() => {
          console.warn(`圖片載入失敗，切換為預設圖: ${src}`);
          setHasError(true);
        }}
        {...rest}
      />
    </div>
  );
}
