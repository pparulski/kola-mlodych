
// src/components/ebooks/card/EbookCover.tsx
import { BookOpenText } from "lucide-react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface EbookCoverProps {
  coverUrl?: string;
  title: string;
  /**
   * 'small', 'medium', 'large' can retain fixed pixel widths for other contexts if needed.
   * 'fill' will make the cover take full width of parent and use aspect ratio for height.
   */
  size?: 'small' | 'medium' | 'large' | 'fill';
  onClick?: () => void;
  className?: string; // Allow passing additional classNames
  aspectRatioValue?: number; // e.g., 3/4 for book cover
}

export function EbookCover({
  coverUrl,
  title,
  size = 'large',
  onClick,
  className,
  aspectRatioValue = 3 / 4, // Default book aspect ratio (width/height)
}: EbookCoverProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  let containerWidthClass = 'w-full'; // Default to full width for 'fill' and 'large'
  let iconSize = 64; // Default for 'large' or 'fill'

  // Fixed pixel sizes for non-carousel contexts (if strictly needed)
  // It's generally better if these also become responsive or rely on parent width.
  if (size === 'small') {
    containerWidthClass = 'w-[220px]'; // As per your original
    iconSize = 48;
    // Aspect ratio will be applied to this width
  } else if (size === 'medium') {
    containerWidthClass = 'w-[180px]'; // As per your original
    iconSize = 40;
    // Aspect ratio will be applied to this width
  } else if (size === 'large') {
    // For 'large', we assume it's in a context where w-full makes sense,
    // and height is determined by aspect ratio.
    iconSize = 64;
  } else if (size === 'fill') {
    // Explicitly full width for carousel or similar fill scenarios
    containerWidthClass = 'w-full';
    iconSize = 40; // Or adjust as needed for this context
  }

  const finalContainerClasses = cn(
    "relative overflow-hidden rounded-md cursor-pointer group", // Added group for potential hover effects on image
    containerWidthClass, // Apply width based on size
    "hover:opacity-90 transition-opacity duration-200", // General hover
    className
  );

  const imageClasses = cn(
    "w-full h-full object-contain rounded-md transition-all duration-200 group-hover:scale-[1.02]", // Image scales on group hover
    imageLoaded ? 'opacity-100' : 'opacity-0'
  );

  return (
    <div className={finalContainerClasses} onClick={onClick}>
      <AspectRatio ratio={aspectRatioValue} className="bg-muted/20">
        {coverUrl ? (
          <>
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 h-full w-full" />
            )}
            <LazyLoadImage
              src={coverUrl}
              alt={`Okładka ${title}`}
              className={imageClasses}
              effect="opacity"
              threshold={100}
              onLoad={() => setImageLoaded(true)}
              wrapperProps={{ style: { display: 'block', width: '100%', height: '100%' } }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <BookOpenText size={iconSize} className="opacity-50" />
          </div>
        )}
      </AspectRatio>
    </div>
  );
}
