
import { BookOpenText } from "lucide-react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface EbookCoverProps {
  coverUrl?: string;
  title: string;
  size?: 'small' | 'large';
  onClick?: () => void;
}

export function EbookCover({ coverUrl, title, size = 'large', onClick }: EbookCoverProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const dimensions = {
    small: {
      width: 'w-[180px]',  // Increased from 140px to 180px
      height: 'h-[240px]', // Increased from 180px to 240px
      iconSize: 48
    },
    large: {
      width: 'w-full',
      height: 'h-[280px]',
      iconSize: 64
    }
  };
  
  const { width, height, iconSize } = dimensions[size];
  
  if (coverUrl) {
    return (
      <div 
        className={`relative ${width} ${height} bg-muted/20 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={onClick}
      >
        {!imageLoaded && (
          <Skeleton className="h-full w-full absolute inset-0" />
        )}
        <LazyLoadImage
          src={coverUrl}
          alt={`Okładka ${title}`}
          className="w-full h-full object-contain rounded-md transition-transform hover:scale-[1.02]"
          effect="opacity"
          threshold={100}
          afterLoad={() => setImageLoaded(true)}
        />
      </div>
    );
  }
  
  return (
    <div 
      className={`${width} ${height} bg-muted/30 rounded-md flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={onClick}
    >
      <BookOpenText size={iconSize} className="opacity-50" />
    </div>
  );
}
