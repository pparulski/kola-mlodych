import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface ImagePreloaderProps {
  imageUrl?: string | null;
  priority?: boolean;
}

export function ImagePreloader({ imageUrl, priority = true }: ImagePreloaderProps) {
  useEffect(() => {
    // Also programmatically preload the image for browsers that don't support link preload
    if (imageUrl && priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);

      // Cleanup on unmount
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [imageUrl, priority]);

  if (!imageUrl || !priority) {
    return null;
  }

  return (
    <Helmet>
      <link
        rel="preload"
        as="image"
        href={imageUrl}
        fetchPriority="high"
      />
    </Helmet>
  );
}