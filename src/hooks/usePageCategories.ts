
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";

export function usePageCategories(pageId?: string) {
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

  // Fetch existing page categories if editing
  const { data: pageCategories } = useQuery({
    queryKey: ['page-categories', pageId],
    queryFn: async () => {
      if (!pageId) return [];
      
      const { data, error } = await supabase
        .from('static_page_categories')
        .select(`
          category_id,
          categories(id, slug)
        `)
        .eq('static_page_id', pageId);

      if (error) throw error;
      return data.map(item => item.categories.slug) as string[];
    },
    enabled: !!pageId,
  });

  // Set selected categories when page categories are loaded
  useEffect(() => {
    if (pageCategories) {
      setSelectedCategories(pageCategories);
    }
  }, [pageCategories]);

  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter(c => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  return {
    categories,
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
  };
}
