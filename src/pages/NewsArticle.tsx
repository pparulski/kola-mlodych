
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isValid } from "date-fns";
import { pl } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsContent } from "@/components/news/NewsContent";
import { CategoryBadgeList } from "@/components/categories/CategoryBadgeList";
import { Category } from "@/types/categories";
import { NewsArticle as NewsArticleType } from "@/types/news";

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch article data
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

  // Fetch article categories
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

  // Set page title
  useEffect(() => {
    if (article) {
      document.title = `${article.title} - Młodzi IP`;
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Skeleton className="h-12 w-3/4 max-w-2xl" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-8 text-center bg-[hsl(var(--content-box))] rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Artykuł nie został znaleziony</h1>
          <p className="text-muted-foreground">
            Przepraszamy, ale artykuł o tym adresie nie istnieje lub został usunięty.
          </p>
        </div>
      </div>
    );
  }

  // Format date
  const formattedDate = article.date
    ? (() => {
        const parsedDate = new Date(article.date);
        return isValid(parsedDate)
          ? format(parsedDate, "d MMMM yyyy", { locale: pl })
          : "";
      })()
    : "";

  return (
    <div className="container mx-auto px-4 space-y-8 max-w-4xl">
      {article.featured_image && (
        <div className="w-full relative">
          <img
            src={article.featured_image}
            alt=""
            className="w-full h-[300px] md:h-[400px] object-cover rounded-lg"
          />
        </div>
      )}

      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {formattedDate && (
            <span className="text-muted-foreground">{formattedDate}</span>
          )}
          
          {!isLoadingCategories && categories && categories.length > 0 && (
            <CategoryBadgeList categories={categories} />
          )}
        </div>

        <div className="bg-[hsl(var(--content-box))] p-6 rounded-lg">
          <NewsContent content={article.content} />
        </div>
      </div>
    </div>
  );
}
