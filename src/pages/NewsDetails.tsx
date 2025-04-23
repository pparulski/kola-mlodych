import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBadgeList } from "@/components/categories/CategoryBadgeList";
import { Category } from "@/types/categories";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  const formattedDate = article.created_at ? format(new Date(article.created_at), "d MMMM yyyy", { locale: pl }) : "";

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <Button 
        variant="ghost" 
        className="text-red-500 hover:text-red-600 pl-0"
        onClick={handleGoBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Wróć
      </Button>

      <article className="space-y-6 p-4 md:p-6 bg-card rounded-lg border-2 border-border overflow-hidden">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary break-words">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            {formattedDate && (
              <p className="text-sm text-foreground my-0">{formattedDate}</p>
            )}
            
            {articleCategories && articleCategories.length > 0 && (
              <CategoryBadgeList categories={articleCategories} className="m-0 inline-flex" />
            )}
          </div>
          
          {article.featured_image && (
            <img
              src={article.featured_image}
              alt=""
              className="w-full h-auto object-cover rounded-md"
            />
          )}
          
          <div 
            className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  );
}
