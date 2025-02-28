
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";

export function useNewsCategories(newsId?: string) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch all available categories
  const { data: categories } = useQuery({
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

  // Fetch existing news categories if editing
  const { data: newsCategories } = useQuery({
    queryKey: ['news-categories', newsId],
    queryFn: async () => {
      if (!newsId) return [];
      
      const { data, error } = await supabase
        .from('news_categories')
        .select(`
          category_id,
          categories(id, slug)
        `)
        .eq('news_id', newsId);

      if (error) throw error;
      return data.map(item => item.categories.slug) as string[];
    },
    enabled: !!newsId,
  });

  return {
    selectedCategories,
    setSelectedCategories,
    categories,
    newsCategories
  };
}
