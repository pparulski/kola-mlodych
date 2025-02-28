
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsPreview } from "@/components/news/NewsPreview";
import { useState, useEffect } from "react";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { Category } from "@/types/categories";

export default function Index() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Fetch all available categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch news articles, filtered by categories if any are selected
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news', selectedCategories],
    queryFn: async () => {
      console.log('Fetching news articles with categories:', selectedCategories);
      
      let query = supabase
        .from('news')
        .select(`
          *,
          news_categories!inner (
            category_id,
            categories(slug)
          )
        `)
        .order('created_at', { ascending: false });
      
      // If categories are selected, filter by them
      if (selectedCategories.length > 0) {
        query = query.in('news_categories.categories.slug', selectedCategories);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log("Fetched news articles:", data);

      // Remove duplicates (since we're doing a JOIN)
      const uniqueNews = Array.from(new Map(data.map(item => [item.id, item])).values());
      return uniqueNews;
    },
    enabled: !categoriesLoading, // Only run this query when categories are loaded
  });

  // If no categories are selected, fetch all news
  const { data: allNews, isLoading: allNewsLoading } = useQuery({
    queryKey: ['all-news'],
    queryFn: async () => {
      console.log('Fetching all news articles');
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched all news articles:", data);
      return data;
    },
    enabled: selectedCategories.length === 0, // Only run when no categories are selected
  });

  const isLoading = categoriesLoading || (selectedCategories.length > 0 ? newsLoading : allNewsLoading);
  const displayedNews = selectedCategories.length > 0 ? news : allNews;

  if (isLoading) {
    return <div>Wczytywanie...</div>;
  }

  return (
    <div className="space-y-6">
      {displayedNews?.map((article) => (
        <NewsPreview
          key={article.id}
          id={article.id}
          slug={article.slug}
          title={article.title}
          content={article.content}
          date={article.created_at}
          featured_image={article.featured_image}
        />
      ))}
      
      {categories && categories.length > 0 && (
        <CategoryFilter
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          availableCategories={categories}
          position="bottom"
        />
      )}
    </div>
  );
}
