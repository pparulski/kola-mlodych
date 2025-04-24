
import React from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

interface GalleryViewProps {
  images: {
    url: string;
    caption?: string | null;
  }[];
}

export function GalleryView({ images }: GalleryViewProps) {
  const items = images.map(image => ({
    original: image.url,
    thumbnail: image.url,
    description: image.caption,
  }));

  return (
    <div className="my-4">
      <ImageGallery
        items={items}
        showPlayButton={false}
        showFullscreenButton={true}
        showThumbnails={true}
        showBullets={false}
      />
    </div>
  );
}
