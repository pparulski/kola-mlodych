
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
import { FeaturedImage } from "@/components/common/FeaturedImage";
import { SEO } from "@/components/seo/SEO";
import { stripHtmlAndDecodeEntities } from "@/lib/utils";

export default function NewsArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

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

  // Generate a clean excerpt for SEO description 
  const generateExcerpt = (content?: string): string => {
    if (!content) return '';
    
    // Use our improved HTML stripping function for consistency
    return stripHtmlAndDecodeEntities(content).substring(0, 160);
  };

  // For debugging
  useEffect(() => {
    if (article) {
      console.log("Article detail rendering:", {
        title: article.title,
        contentLength: article.content?.length || 0,
        contentPreview: article.content?.substring(0, 50)
      });
    }
  }, [article]);

  if (isLoading) {
    return (
      <div className="space-y-4 mt-2 animate-pulse">
        <Skeleton className="h-10 w-3/4 max-w-2xl" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mt-2 animate-fade-in">
        <SEO 
          title="Artykuł nie znaleziony" 
          description="Przepraszamy, ale artykuł o tym adresie nie istnieje lub został usunięty."
        />
        <div className="content-box p-5 text-center shadow-elevated">
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

  // Extract category names for SEO keywords
  const categoryNames = categories?.map(cat => cat.name).filter(Boolean) || [];
  
  return (
    <div className="mt-2 animate-enter">
      <SEO 
        title={article.title}
        description={generateExcerpt(article.content)}
        image={article.featured_image || undefined}
        article={{
          publishedAt: article.date || article.created_at || undefined,
          modifiedAt: article.date || article.created_at || undefined,
          categories: categoryNames,
        }}
        keywords={categoryNames.join(', ')}
      />

      <div className="content-box shadow-elevated overflow-hidden">
        {article.featured_image && (
          <FeaturedImage 
            src={article.featured_image}
            aspectRatio={16/9}
            priority
            objectFit="cover"
            className="w-full"
            containerClassName="w-full"
          />
        )}

        <div className="p-5 md:p-6 space-y-4 md:space-y-5">
          <h1 className="text-2xl md:text-4xl font-bold mt-2">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2 justify-between">
            {formattedDate && (
              <span className="text-sm font-medium italic text-muted-foreground dark:text-muted-foreground">{formattedDate}</span>
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
