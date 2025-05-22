
import { GalleryRenderer } from "../gallery/GalleryRenderer";
import { useEffect } from "react";
import { FeaturedImage } from "@/components/common/FeaturedImage";

interface NewsContentProps {
  content: string;
  title?: string;
  date?: string;
  featured_image?: string;
}

export function NewsContent({ content, title, date, featured_image }: NewsContentProps) {
  // Update the document title when the component renders with a title
  useEffect(() => {
    if (title) {
      document.title = `${title} - Młodzi IP`;
    }
  }, [title]);

  return (
    <div className="news-content max-w-full overflow-hidden">
      {featured_image && (
        <FeaturedImage
          src={featured_image}
          aspectRatio={16/9}
          adaptiveAspectRatio={true} // Use the natural aspect ratio of the image
          objectFit="cover"
          className="w-full mb-2" // Reduced margin even further
          priority // Main content image should load immediately
        />
      )}
      <div className="prose prose-lg dark:prose-invert hugerte-content">
        <GalleryRenderer content={content} />
      </div>
    </div>
  );
}
