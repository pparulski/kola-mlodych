
import { GalleryRenderer } from "../gallery/GalleryRenderer";

interface NewsContentProps {
  content: string;
  title?: string;
  date?: string;
  featured_image?: string;
}

export function NewsContent({ content, title, date, featured_image }: NewsContentProps) {
  return (
    <div className="news-content max-w-full overflow-hidden prose prose-lg dark:prose-invert hugerte-content">
      <GalleryRenderer content={content} />
    </div>
  );
}
