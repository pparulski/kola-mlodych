
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
import { stripHtmlAndDecodeEntities } from "@/lib/utils";
import { UnifiedContentRenderer } from "@/components/content/UnifiedContentRenderer";

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
        .maybeSingle();

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

  // Generate standardized description for SEO (exactly 160 characters)
  const generateDescription = (content?: string): string => {
    if (!content) return '';
    // Use our improved HTML stripping function with proper spacing
    let plainText = stripHtmlAndDecodeEntities(content);

    // Strip the Alarm Studencki intro (mirror middleware behavior)
    const alarmPattern = /^\s*Tekst jest częścią.*?naszą gazetę\.(\s+|$)/i;
    plainText = plainText.replace(alarmPattern, '').trim();
    
    // Ensure exactly 160 characters
    if (plainText.length > 160) {
      return `${plainText.substring(0, 157)}...`;
    }
    
    return plainText;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Add debugging for SEO data
  useEffect(() => {
    if (article) {
      console.log('NewsDetails: Article data for SEO:', {
        title: article.title,
        featured_image: article.featured_image,
        content_length: article.content?.length,
        slug: article.slug,
        date: article.date,
        created_at: article.created_at
      });
    }
  }, [article]);

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
        <div className="p-5 text-center content-box">
          <h1 className="text-xl md:text-2xl font-bold mb-3">Artykuł nie został znaleziony</h1>
          <p className="text-muted-foreground">
            Przepraszamy, ale artykuł o tym adresie nie istnieje lub został usunięty.
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = article.date 
    ? format(new Date(article.date), "d MMMM yyyy", { locale: pl }) 
    : (article.created_at ? format(new Date(article.created_at), "d MMMM yyyy", { locale: pl }) : "");
  
  // Extract category names for SEO keywords
  const categoryNames = articleCategories?.map(cat => cat.name).filter(Boolean) || [];

  // Debug the image URL handling
  const featuredImageUrl = article.featured_image;
  console.log('NewsDetails: Featured image URL:', featuredImageUrl);

  return (
    <div className="mx-auto animate-enter">
      <SEO 
        title={article.title}
        description={generateDescription(article.content)}
        image={featuredImageUrl}
        article={{
          publishedAt: article.date || article.created_at || undefined,
          modifiedAt: article.date || article.created_at || undefined,
          categories: categoryNames,
          author: "Koła Młodych OZZ IP"
        }}
        keywords={categoryNames.join(', ')}
      />
      
      <article className="p-5 bg-[hsl(var(--content-box))] rounded-lg border border-border overflow-hidden">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-primary break-words">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            {formattedDate && (
              <p className="text-sm font-medium italic text-muted-foreground dark:text-muted-foreground my-0">{formattedDate}</p>
            )}
            
            {articleCategories && articleCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {articleCategories.map((category) => (
                  <span key={category.id} className="category-pill">
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {article.featured_image && (
            <FeaturedImage
              src={article.featured_image}
              aspectRatio={16/9}
              adaptiveAspectRatio={true}
              objectFit="cover"
              priority
              className="w-full mb-2"
            />
          )}
          
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>img]:shadow-sm">
            <UnifiedContentRenderer content={article.content} />
          </div>
        </div>
      </article>
    </div>
  );
}
