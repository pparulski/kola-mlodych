import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

  // If we're using the aspect ratio component
  if (aspectRatio) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <AspectRatio ratio={aspectRatio}>
          {isLoading && (
            <Skeleton className="absolute inset-0 z-0 h-full w-full" />
          )}
          <img
            src={src}
            alt={alt}
            className={cn(
              "h-full w-full transition-opacity",
              objectFit && `object-${objectFit}`,
              rounded && "rounded-md",
              isLoading ? "opacity-0" : "opacity-100",
              error ? "opacity-50" : "",
              className
            )}
            style={{ objectPosition }}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
          />
        </AspectRatio>
      </div>
    );
  }

  // Otherwise, render a regular image
  return (
    <div className={cn("relative", containerClassName)}>
      {isLoading && (
        <Skeleton 
          className={cn(
            "absolute inset-0 z-0", 
            height ? `h-[${height}px]` : "h-full", 
            width ? `w-[${width}px]` : "w-full"
          )} 
        />
      )}
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
        loading={priority ? "eager" : "lazy"}
        onClick={onClick}
      />
    </div>
  );
}
