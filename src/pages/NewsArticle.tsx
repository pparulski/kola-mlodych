
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
    
    // Remove HTML tags and limit to ~160 characters
    const plainText = content.replace(/<[^>]*>?/gm, '');
    const excerpt = plainText.substring(0, 160);
    
    // Add ellipsis if text was truncated
    return plainText.length > 160 ? `${excerpt}...` : excerpt;
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
      <div className="page-container section-spacing mt-4">
        <Skeleton className="h-10 w-3/4 max-w-2xl" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-container mt-4">
        <SEO 
          title="Artykuł nie znaleziony" 
          description="Przepraszamy, ale artykuł o tym adresie nie istnieje lub został usunięty."
        />
        <div className="content-box text-center">
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
    <div className="page-container mt-4">
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

      <div className="content-box">
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

        <div className="element-spacing">
          <h1 className="text-2xl md:text-4xl font-bold">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2">
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
