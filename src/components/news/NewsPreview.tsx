import { Link } from "react-router-dom";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface NewsPreviewProps {
  id: string;
  title: string;
  content: string;
  date?: string;
  featured_image?: string;
  slug?: string;
}

export function NewsPreview({
  id,
  title,
  content,
  date,
  featured_image,
  slug,
}: NewsPreviewProps) {
  const previewContent = content.length > 300 
    ? content.substring(0, 300) + "..."
    : content;

  const formattedDate = date 
    ? format(new Date(date), "d MMMM yyyy", { locale: pl })
    : "";

  return (
    <article className="space-y-6 p-6 bg-card rounded-lg shadow-sm">
      {featured_image && (
        <img
          src={featured_image}
          alt=""
          className="w-full h-48 object-cover rounded-md"
        />
      )}
      <div className="space-y-6">
        <div className="space-y-1">
          <Link
            to={slug ? `/static/${slug}` : `/news/${id}`}
            className="hover:text-accent transition-colors"
          >
            <h2 className="text-2xl font-bold">{title}</h2>
          </Link>
          {formattedDate && (
            <p className="text-sm text-foreground">{formattedDate}</p>
          )}
        </div>
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
        <div className="pt-4">
          <Link
            to={slug ? `/static/${slug}` : `/news/${id}`}
            className="text-primary hover:text-accent transition-colors"
          >
            Czytaj więcej
          </Link>
        </div>
      </div>
    </article>
  );
}