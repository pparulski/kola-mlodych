
import { SocialMediaRenderer } from "../editor/SocialMediaRenderer";
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

  // First process galleries, then social media embeds
  const processContent = (htmlContent: string) => {
    // This will be handled by GalleryRenderer for galleries
    // and SocialMediaRenderer for social embeds
    return htmlContent;
  };

  return (
    <div className="news-content max-w-full overflow-hidden">
      {featured_image && (
        <FeaturedImage
          src={featured_image}
          aspectRatio={16/9}
          adaptiveAspectRatio={true}
          objectFit="cover"
          className="w-full mb-2"
          priority
        />
      )}
      <div className="hugerte-content">
        <SocialMediaRenderer content={content} />
      </div>
    </div>
  );
}
