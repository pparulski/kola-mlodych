
import { Link } from "react-router-dom";
import { format, isValid } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { CategoryBadgeList } from "@/components/categories/CategoryBadgeList";
import { FeaturedImage } from "@/components/common/FeaturedImage";

interface NewsPreviewProps {
  id: string;
  slug: string;
  title: string;
  preview_content?: string;
  content?: string;
  date?: string;
  featured_image?: string;
  category_names?: (string | null)[];
}

export function NewsPreview({
  id,
  slug,
  title,
  preview_content,
  content,
  date,
  featured_image,
  category_names = [],
}: NewsPreviewProps) {
  // Use pre-processed preview_content from the view, or fall back to processing content
  const previewContent = preview_content || (content && content.length > 300 
    ? content.replace(/\[gallery id="([^"]+)"\]/g, '').substring(0, 300) + "..."
    : content);

  const formattedDate = date 
    ? (() => {
        const parsedDate = new Date(date);
        return isValid(parsedDate) 
          ? format(parsedDate, "d MMMM yyyy", { locale: pl })
          : "";
      })()
    : "";

  // Filter out null/empty category names
  const validCategoryNames = (category_names || []).filter((name): name is string => 
    name !== null && name !== undefined && name !== ""
  );

  return (
    <article className="space-y-6 p-4 md:p-6 bg-card bg-[hsl(var(--content-box))] rounded-lg border-2 border-border overflow-hidden">
      {featured_image && (
        <FeaturedImage
          src={featured_image}
          aspectRatio={21/9} 
          objectFit="cover"
          className="w-full"
          lazyload={true}
          lazyloadHeight={150}
          alt={title}
        />
      )}
      <div className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Link
            to={`/news/${slug}`}
            className="no-underline"
          >
            <h2 className="text-xl md:text-2xl font-bold text-primary hover:text-accent transition-colors break-words">{title}</h2>
          </Link>
          
          <div className="flex flex-wrap items-center gap-2">
            {formattedDate && (
              <p className="text-sm font-medium italic text-muted-foreground dark:text-muted-foreground my-0">{formattedDate}</p>
            )}
            
            {validCategoryNames.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {validCategoryNames.map((name) => (
                  <span key={name} className="text-sm bg-primary/20 px-2 py-1 rounded-full">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div 
          className="prose prose-sm md:prose-base max-w-none dark:prose-invert break-words overflow-hidden"
          dangerouslySetInnerHTML={{ __html: previewContent || '' }}
        />
        
        <div className="pt-4">
          <Link
            to={`/news/${slug}`}
            className="inline-flex items-center text-primary hover:text-accent transition-colors no-underline"
          >
            Czytaj więcej <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
