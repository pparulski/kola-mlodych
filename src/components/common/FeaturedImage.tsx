import React, { useState, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';

export interface FeaturedImageProps {
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
  onClick,
  rounded = true,
  containerClassName,
  lazyload = true,
  lazyloadHeight = 200,
  lazyloadOffset = 100,
  adaptiveAspectRatio = false,
}: FeaturedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [naturalAspectRatio, setNaturalAspectRatio] = useState<number | null>(null);

  // If adaptiveAspectRatio is true, preload the image to get its natural dimensions
  useEffect(() => {
    if (adaptiveAspectRatio && src) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setNaturalAspectRatio(ratio);
      };
      img.src = src;
    }
  }, [src, adaptiveAspectRatio]);

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
    // Force eager loading for priority images or when lazyload is disabled
    if (priority || !lazyload) {
      return (
        <img
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity",
            objectFit && `object-${objectFit}`,
            rounded && "rounded-md",
            isLoading ? "opacity-0" : "opacity-100",
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
          fetchPriority="high" // Add high priority hint for critical images
          onClick={onClick}
        />
      );
    } else {
      // Use LazyLoadImage for lazy loading
      return (
        <LazyLoadImage
          src={src}
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
