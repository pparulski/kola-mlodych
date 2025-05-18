
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { NewsPreview } from "./news/NewsPreview";

interface NewsCardProps {
  id: string;
  title: string;
  date: string;
  content?: string;
  preview_content?: string;
  slug: string;
  featured_image?: string | null;
  previewLength?: number;
}

export function NewsCard(props: NewsCardProps) {
  const formattedDate = format(new Date(props.date), "d MMMM yyyy", { locale: pl });
  
  console.log("NewsCard rendering with:", {
    title: props.title,
    hasPreviewContent: !!props.preview_content,
    previewContentLength: props.preview_content?.length || 0
  });
  
  return (
    <div className="w-full">
      <NewsPreview 
        id={props.id}
        slug={props.slug}
        title={props.title}
        date={formattedDate}
        preview_content={props.preview_content || ""}
        content={props.content}
        featured_image={props.featured_image || undefined}
      />
    </div>
  );
}
