import React, { useState, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getOptimizedSupabaseImageUrl, getResponsiveSrcSet } from "@/lib/utils";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';

export interface FeaturedImageProps {
  sizes?: string;
  qualityMobile?: number; // default 80
  qualityDesktop?: number; // default 100
  src: string | null | undefined;
  alt?: string;
  aspectRatio?: number; // e.g., 16/9, 4/3, 1, etc.
  className?: string;
  fill?: boolean; // Whether to fill the container
  height?: number | string;
  width?: number | string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  priority?: boolean; // For images above the fold
  priorityLevel?: 'high' | 'medium' | 'low'; // For more granular priority control
  onClick?: () => void;
  rounded?: boolean;
  containerClassName?: string;
  lazyload?: boolean; // For controlling lazy loading
  lazyloadHeight?: number; // Height for the lazy load placeholder
  lazyloadOffset?: number; // Offset for triggering the lazy load
  adaptiveAspectRatio?: boolean; // New prop to dynamically adapt to image's natural ratio
}

export function FeaturedImage({
  src,
  alt = "",
  aspectRatio = 16/9,
  className,
  fill = false,
  height,
  width,
  objectFit = "cover",
  objectPosition = "center",
  priority = false,
  priorityLevel = 'low',
  onClick,
  rounded = true,
  containerClassName,
  lazyload = true,
  lazyloadHeight = 200,
  lazyloadOffset = 100,
  adaptiveAspectRatio = false,
  sizes,
  qualityMobile = 80,
  qualityDesktop = 100,
}: FeaturedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [naturalAspectRatio, setNaturalAspectRatio] = useState<number | null>(null);

  // If adaptiveAspectRatio is true, preload the image to get its natural dimensions
  useEffect(() => {
    if (adaptiveAspectRatio && src) {
      const img = new Image();
      // Set priority based on priorityLevel or priority boolean
      if (priority || priorityLevel === 'high') {
        img.fetchPriority = 'high';
      } else if (priorityLevel === 'medium') {
        img.fetchPriority = 'high'; // Still use high for medium priority
      }
      img.onload = () => {
        const ratio = img.width / img.height;
        setNaturalAspectRatio(ratio);
      };
      img.src = src;
    }
  }, [src, adaptiveAspectRatio, priority]);

  // Determine which aspect ratio to use
  const effectiveAspectRatio = adaptiveAspectRatio && naturalAspectRatio ? naturalAspectRatio : aspectRatio;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // If src is empty, show nothing
  if (!src) {
    return null;
  }

  // Create the image element
  const renderImage = () => {
    // Build responsive sources for Supabase storage images
    // Mobile-first sizes; adjust as needed for your cards/article headers
    const widths = [360, 540, 720, 960, 1200];

    const isSupabase = src.includes('/storage/v1/object/public/');
    const selectedQuality = (typeof window !== 'undefined' && window.innerWidth >= 1024) ? qualityDesktop : qualityMobile;
    const optimized = isSupabase
      ? getOptimizedSupabaseImageUrl(src, { width: 720, quality: selectedQuality, resize: objectFit === 'contain' ? 'contain' : 'cover' })
      : { url: src };

    const initialSrc = optimized.url || src;
    const initialSet = isSupabase ? getResponsiveSrcSet(src, widths, { quality: selectedQuality, resize: objectFit === 'contain' ? 'contain' : 'cover' }) : undefined;

    const [currentSrc, setCurrentSrc] = React.useState<string>(initialSrc);
    const [currentSet, setCurrentSet] = React.useState<string | undefined>(initialSet);
    const [usedOptimized, setUsedOptimized] = React.useState<boolean>(isSupabase);

    const handleImgError = () => {
      // Fallback to original object URL once if optimized fails
      if (usedOptimized) {
        setCurrentSrc(src);
        setCurrentSet(undefined);
        setUsedOptimized(false);
        return;
      }
      handleError();
    };

    // Force eager loading for priority images or when lazyload is disabled
    if (priority || !lazyload) {
      return (
        <img
          src={currentSrc}
          srcSet={currentSet}
          sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"}
          alt={alt}
          className={cn(
            // Remove transition-opacity for priority images to reduce render delay
            !priority && "transition-opacity",
            objectFit && `object-${objectFit}`,
            rounded && "rounded-md",
            isLoading && !priority ? "opacity-0" : "opacity-100",
            error ? "opacity-50" : "",
            className
          )}
          style={{
            objectPosition,
            height,
            width
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="eager"
          {...((priority || priorityLevel === 'high' || priorityLevel === 'medium') && {
            fetchpriority: (priority || priorityLevel === 'high') ? 'high' : 'high',
            decoding: (priority || priorityLevel === 'high') ? 'sync' : 'async'
          })}
          onClick={onClick}
        />
      );
    } else {
      // Use LazyLoadImage for lazy loading
      return (
        <LazyLoadImage
          src={currentSrc}
          srcSet={currentSet}
          sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"}
          alt={alt}
          className={cn(
            "transition-opacity",
            objectFit && `object-${objectFit}`,
            rounded && "rounded-md",
            error ? "opacity-50" : "",
            className
          )}
          style={{ 
            objectPosition,
            height,
            width 
          }}
          effect="opacity"
          placeholderSrc=""
          height={lazyloadHeight}
          afterLoad={handleLoad}
          onError={handleError}
          threshold={lazyloadOffset}
          onClick={onClick}
          wrapperClassName="w-full h-full"
        />
      );
    }
  };

  // If using aspect ratio
  if (effectiveAspectRatio) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <AspectRatio ratio={effectiveAspectRatio}>
          {isLoading && lazyload && !priority && (
            <Skeleton className="absolute inset-0 z-0 h-full w-full" />
          )}
          {renderImage()}
        </AspectRatio>
      </div>
    );
  }

  // For regular image without aspect ratio
  return (
    <div className={cn("relative", containerClassName)}>
      {isLoading && lazyload && !priority && (
        <Skeleton 
          className={cn(
            "absolute inset-0 z-0", 
            height ? `h-[${height}px]` : "h-full", 
            width ? `w-[${width}px]` : "w-full"
          )} 
        />
      )}
      {renderImage()}
    </div>
  );
}
