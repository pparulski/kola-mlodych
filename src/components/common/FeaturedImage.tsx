
import React from "react";
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
  lazyload?: boolean; // New prop for controlling lazy loading
  lazyloadHeight?: number; // Height for the lazy load placeholder
  lazyloadOffset?: number; // Offset for triggering the lazy load
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
  lazyload = true, // Default to lazy loading enabled
  lazyloadHeight = 200,
  lazyloadOffset = 100,
}: FeaturedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

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
    if (priority || !lazyload) {
      // Use regular img for priority images or when lazyload is disabled
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
  if (aspectRatio) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <AspectRatio ratio={aspectRatio}>
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
