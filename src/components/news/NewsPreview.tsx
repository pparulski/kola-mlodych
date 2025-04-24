
import { Link } from "react-router-dom";
import { format, isValid } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBadgeList } from "@/components/categories/CategoryBadgeList";
import { Category } from "@/types/categories";

interface NewsPreviewProps {
  id: string;
  slug: string;
  title: string;
  content: string;
  date?: string;
  featured_image?: string;
}

export function NewsPreview({
  id,
  slug,
  title,
  content,
  date,
  featured_image,
}: NewsPreviewProps) {
  const queryClient = useQueryClient();
  const previewContent = content.length > 300 
    ? content.substring(0, 300) + "..."
    : content;

  const formattedDate = date 
    ? (() => {
        const parsedDate = new Date(date);
        return isValid(parsedDate) 
          ? format(parsedDate, "d MMMM yyyy", { locale: pl })
          : "";
      })()
    : "";

  // Fetch article categories with staleTime: 0 to ensure fresh data
  const { data: articleCategories } = useQuery({
    queryKey: ['news-preview-categories', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_categories')
        .select(`
          categories(*)
        `)
        .eq('news_id', id);

      if (error) throw error;
      return data.map(item => item.categories) as Category[];
    },
    staleTime: 0,
  });

  return (
    <article className="space-y-6 p-4 md:p-6 bg-card bg-[hsl(var(--content-box))] rounded-lg border-2 border-border overflow-hidden">
      {featured_image && (
        <img
          src={featured_image}
          alt=""
          className="w-full h-48 object-cover rounded-md"
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
              <p className="text-sm text-foreground my-0">{formattedDate}</p>
            )}
            
            {articleCategories && articleCategories.length > 0 && (
              <CategoryBadgeList categories={articleCategories} className="m-0 inline-flex" />
            )}
          </div>
        </div>
        <div 
          className="prose prose-sm md:prose-base max-w-none dark:prose-invert break-words overflow-hidden"
          dangerouslySetInnerHTML={{ __html: previewContent }}
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
