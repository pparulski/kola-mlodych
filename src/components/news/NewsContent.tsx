
import { GalleryRenderer } from "../gallery/GalleryRenderer";
import { useEffect } from "react";

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
    <div className="news-content max-w-full overflow-hidden prose prose-lg dark:prose-invert hugerte-content">
      <GalleryRenderer content={content} />
    </div>
  );
}
