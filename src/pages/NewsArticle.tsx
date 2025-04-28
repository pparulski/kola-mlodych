import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isValid } from "date-fns";
import { pl } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryBadgeList } from "@/components/categories/CategoryBadgeList";
import { Category } from "@/types/categories";
import { NewsArticle as NewsArticleType } from "@/types/news";
import { GalleryRenderer } from "@/components/gallery/GalleryRenderer";

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Ensure page scrolls to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      if (!slug) return null;
      console.log("Fetching news article with slug:", slug);
      
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      console.log("Article data:", data);
      return data as NewsArticleType;
    },
    enabled: !!slug,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["news-article-categories", article?.id],
    queryFn: async () => {
      if (!article) return [];
      
      const { data, error } = await supabase
        .from("news_categories")
        .select(`
          categories(*)
        `)
        .eq("news_id", article.id);

      if (error) throw error;
      return data.map(item => item.categories) as Category[];
    },
    enabled: !!article,
  });

  useEffect(() => {
    if (article) {
      // Only set document title, keep header title as "Aktualności"
      document.title = `${article.title} - Młodzi IP`;
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 max-w-2xl" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div>
        <div className="p-4 md:p-6 text-center bg-[hsl(var(--content-box))] rounded-lg shadow-sm">
          <h1 className="text-xl md:text-2xl font-bold mb-3">Artykuł nie został znaleziony</h1>
          <p className="text-muted-foreground">
            Przepraszamy, ale artykuł o tym adresie nie istnieje lub został usunięty.
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = article.date
    ? (() => {
        const parsedDate = new Date(article.date);
        return isValid(parsedDate)
          ? format(parsedDate, "d MMMM yyyy", { locale: pl })
          : "";
      })()
    : "";

  return (
    <div>
      <div className="bg-[hsl(var(--content-box))] rounded-lg overflow-hidden">
        {article.featured_image && (
          <div className="w-full relative">
            <img
              src={article.featured_image}
              alt=""
              className="w-full h-[200px] md:h-[400px] object-cover"
            />
          </div>
        )}

        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
          <h1 className="text-2xl md:text-4xl font-bold">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            {formattedDate && (
              <span className="text-sm text-muted-foreground">{formattedDate}</span>
            )}
            
            {!isLoadingCategories && categories && categories.length > 0 && (
              <CategoryBadgeList categories={categories} />
            )}
          </div>

          <GalleryRenderer content={article.content} />
        </div>
      </div>
    </div>
  );
}
