
import { supabase } from "@/integrations/supabase/client";
import { NewsQueryResult, formatNewsItems } from "./useNewsBase";

// Hook for filtering news by categories
export const useNewsCategories = () => {
  const fetchNewsByCategories = async (
    selectedCategories: string[],
    from: number,
    to: number
  ): Promise<NewsQueryResult> => {
    // Step 1: Get category IDs from slugs
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .in('slug', selectedCategories);
      
    if (categoryError) {
      throw categoryError;
    }
    
    if (!categories || categories.length === 0) {
      // No matching categories found
      return { items: [], total: 0 };
    }
    
    const categoryIds = categories.map(cat => cat.id);
    
    // Step 2: Query the news_preview view with category filtering
    const { data: previewItems, count, error: previewError } = await supabase
      .from('news_preview')
      .select('*', { count: 'exact' })
      .contains('category_ids', categoryIds)
      .order('date', { ascending: false })
      .range(from, to);
      
    if (previewError) {
      console.error("Error fetching news previews by categories:", previewError);
      throw previewError;
    }

    console.log("Category filtered news items (raw):", previewItems);
    
    // Use common formatter to ensure consistency
    const formattedItems = formatNewsItems(previewItems);
    console.log("Formatted category news items with proper previews:", formattedItems);
    
    return {
      items: formattedItems,
      total: count || 0
    };
  };

  return { fetchNewsByCategories };
};
