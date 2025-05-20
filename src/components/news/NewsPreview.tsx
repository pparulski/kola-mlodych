
import { Link } from "react-router-dom";
import { format, isValid } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { FeaturedImage } from "@/components/common/FeaturedImage";
import { Button } from "@/components/ui/button";
import { stripHtmlAndDecodeEntities } from "@/lib/utils";

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
  // Use the provided preview content directly if available
  let previewContent = preview_content || "";
  
  // Only generate a preview if one wasn't provided but content exists
  if (!previewContent && content) {
    previewContent = stripHtmlAndDecodeEntities(content).substring(0, 500);
  }
  
  // Add ellipsis if the content was trimmed
  if (previewContent && content) {
    const fullPlainText = stripHtmlAndDecodeEntities(content);
    
    if (previewContent.length < fullPlainText.length) {
      // Add proper ellipsis, checking if the last character is already a period
      if (previewContent.endsWith('.')) {
        previewContent += '.';
      } else {
        previewContent += '...';
      }
    }
  }

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
    <article className="news-card card-hover overflow-hidden animate-fade-in">
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
      <div className="space-y-4 md:space-y-2 md:pt-2">
        <div className="space-y-2">
          <Link
            to={`/news/${slug}`}
            className="no-underline group"
          >
            <h2 className="text-2xl md:text-3xl pt-2 font-bold text-primary group-hover:text-accent transition-colors break-words">{title}</h2>
          </Link>
          
          <div className="flex flex-wrap items-center gap-2 justify-between">
            {formattedDate && (
              <p className="text-sm font-medium italic text-muted-foreground dark:text-muted-foreground my-0">{formattedDate}</p>
            )}
            
            {validCategoryNames.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {validCategoryNames.map((name) => (
                  <span key={name} className="category-pill">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {previewContent && (
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert break-words overflow-hidden line-clamp-10">
            {previewContent}
          </div>
        )}
        
        <div className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="group text-primary hover:text-accent hover:bg-transparent p-0"
          >
            <Link
              to={`/news/${slug}`}
              className="inline-flex items-center no-underline"
              style={{ gap: 0 }}
            >
              Czytaj dalej
              <ArrowRight className="ml-1 h-4 w-4 transition-all duration-300 ease-in-out group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
