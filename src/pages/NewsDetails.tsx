
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBadgeList } from "@/components/categories/CategoryBadgeList";
import { Category } from "@/types/categories";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { FeaturedImage } from "@/components/common/FeaturedImage";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo/SEO";

export function NewsDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading } = useQuery({
    queryKey: ['news-article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: articleCategories } = useQuery({
    queryKey: ['news-categories-display', article?.id],
    queryFn: async () => {
      if (!article?.id) return [];
      
      const { data, error } = await supabase
        .from('news_categories')
        .select(`
          categories(*)
        `)
        .eq('news_id', article.id);

      if (error) throw error;
      return data.map(item => item.categories) as Category[];
    },
    enabled: !!article?.id,
  });

  useEffect(() => {
    if (article?.title) {
      document.title = `${article.title} - Młodzi IP`;
    }
  }, [article]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 container mx-auto px-4 mt-4 animate-pulse">
        <Skeleton className="h-10 w-3/4 max-w-2xl" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 mt-4 animate-fade-in">
        <SEO
          title="Artykuł nie znaleziony"
          description="Przepraszamy, ale artykuł o tym adresie nie istnieje lub został usunięty."
        />
        <div className="p-5 text-center content-box shadow-elevated">
          <h1 className="text-xl md:text-2xl font-bold mb-3">Artykuł nie został znaleziony</h1>
          <p className="text-muted-foreground">
            Przepraszamy, ale artykuł o tym adresie nie istnieje lub został usunięty.
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = article.created_at ? format(new Date(article.created_at), "d MMMM yyyy", { locale: pl }) : "";
  
  // Extract category names for SEO keywords
  const categoryNames = articleCategories?.map(cat => cat.name).filter(Boolean) || [];

  return (
    <div className="space-y-4 container mx-auto px-4 mt-4 animate-enter">
      <SEO 
        title={article.title}
        description={article.content?.substring(0, 150).replace(/<[^>]*>?/gm, '')}
        image={article.featured_image || undefined}
        article={{
          publishedAt: article.created_at || undefined,
          modifiedAt: article.created_at || undefined,
          categories: categoryNames,
        }}
        keywords={categoryNames.join(', ')}
      />
      
      <article className="space-y-4 p-5 bg-[hsl(var(--content-box))] rounded-lg border-2 border-border overflow-hidden shadow-elevated">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold text-primary break-words">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            {formattedDate && (
              <p className="text-sm font-medium italic text-muted-foreground dark:text-muted-foreground my-0">{formattedDate}</p>
            )}
            
            {articleCategories && articleCategories.length > 0 && (
              <CategoryBadgeList categories={articleCategories} className="m-0 inline-flex" />
            )}
          </div>
          
          {article.featured_image && (
            <FeaturedImage
              src={article.featured_image}
              aspectRatio={16/9}
              objectFit="cover"
              priority
              className="w-full shadow-elevated"
            />
          )}
          
          <div 
            className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>img]:shadow-sm"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  );
}
