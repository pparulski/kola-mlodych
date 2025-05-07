
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
  
  // Create a preview_content if previewLength is specified
  const preview_content = props.previewLength && props.content?.length > props.previewLength
    ? `${props.content.replace(/\[gallery id="([^"]+)"\]/g, '').substring(0, props.previewLength)}...`
    : props.content;
  
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
