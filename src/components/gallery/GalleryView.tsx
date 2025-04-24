
import React from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { useIsMobile } from '@/hooks/use-mobile';

interface GalleryViewProps {
  images: {
    url: string;
    caption?: string | null;
  }[];
}

export function GalleryView({ images }: GalleryViewProps) {
  const isMobile = useIsMobile();
  
  const items = images.map(image => ({
    original: image.url,
    thumbnail: image.url,
    description: image.caption,
  }));

  return (
    <div className="my-4 w-full">
      <ImageGallery
        items={items}
        showPlayButton={false}
        showFullscreenButton={true}
        showThumbnails={!isMobile}
        showBullets={isMobile}
        showNav={true}
        lazyLoad={true}
        thumbnailPosition={isMobile ? "bottom" : "bottom"}
        additionalClass="w-full responsive-gallery"
      />
      <style jsx global>{`
        .responsive-gallery .image-gallery-slide img {
          width: 100%;
          height: auto;
          object-fit: contain;
          max-height: 70vh;
        }
        
        @media (max-width: 768px) {
          .responsive-gallery .image-gallery-slide img {
            max-height: 50vh;
          }
        }
      `}</style>
    </div>
  );
}
