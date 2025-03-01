
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsContent } from "@/components/news/NewsContent";
import { CategoryBadgeList } from "@/components/categories/CategoryBadgeList";
import { Category } from "@/types/categories";

export function NewsDetails() {
  const { slug } = useParams();

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

  // Fetch article categories
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      
      {articleCategories && articleCategories.length > 0 && (
        <CategoryBadgeList categories={articleCategories} className="mb-4" />
      )}
      
      <NewsContent 
        content={article.content} 
        featured_image={article.featured_image}
        date={article.created_at}
        title={article.title}
      />
    </div>
  );
}
