
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { NewsPreview } from "./news/NewsPreview";

interface NewsCardProps {
  id: string;
  title: string;
  date: string;
  content: string;
  slug: string;
  featured_image?: string | null;
  previewLength?: number;
}

export function NewsCard(props: NewsCardProps) {
  const formattedDate = format(new Date(props.date), "d MMMM yyyy", { locale: pl });
  
  // Ensure we have content before trying to access it
  const content = props.content || '';
  
  // Process the content and add ellipsis if needed
  const previewLength = props.previewLength || 300;
  const preview_content = content.length > previewLength
    ? `${content.replace(/\[gallery id="([^"]+)"\]/g, '').substring(0, previewLength)}...`
    : content;
  
  console.log("NewsCard generating preview for:", {
    title: props.title,
    contentLength: content.length,
    previewLength,
    hasEllipsis: content.length > previewLength,
    previewStart: preview_content?.substring(0, 50)
  });
  
  return (
    <div className="w-full">
      <NewsPreview 
        id={props.id}
        slug={props.slug}
        title={props.title}
        date={formattedDate}
        preview_content={preview_content}
        content={props.content}
        featured_image={props.featured_image || undefined}
      />
    </div>
  );
}
