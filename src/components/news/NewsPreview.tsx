import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";

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

  return (
    <article className="space-y-4 p-6 bg-card rounded-lg shadow-sm">
      {featured_image && (
        <img
          src={featured_image}
          alt=""
          className="w-full h-48 object-cover rounded-md"
        />
      )}
      <div className="space-y-4">
        <div className="space-y-1">
          <Link
            to={slug ? `/static/${slug}` : `/news/${id}`}
            className="hover:text-accent transition-colors"
          >
            <h2 className="text-2xl font-bold">{title}</h2>
          </Link>
          <p className="text-sm text-foreground">{formatDate(date)}</p>
        </div>
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      </div>
    </article>
  );
}