
import { GalleryRenderer } from "../gallery/GalleryRenderer";

interface NewsContentProps {
  content: string;
  title?: string;
  date?: string;
  featured_image?: string;
}

export function NewsContent({ content }: NewsContentProps) {
  return (
    <div className="news-content">
      <GalleryRenderer content={content} />
    </div>
  );
}
