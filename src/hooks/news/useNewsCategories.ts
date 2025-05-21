
import { supabase } from "@/integrations/supabase/client";
import { NewsQueryResult, formatNewsItems } from "./useNewsBase";

// Hook for filtering news by categories
export const useNewsCategories = () => {
  const fetchNewsByCategories = async (
    selectedCategories: string[],
    from: number,
    to: number
  ): Promise<NewsQueryResult> => {
    console.log(`Fetching news by categories: ${selectedCategories.join(", ")} with range ${from}-${to}`);
    
    // Step 1: Get category IDs from slugs
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .in('slug', selectedCategories);
      
    if (categoryError) {
      console.error("Error fetching category IDs:", categoryError);
      throw categoryError;
    }
    
    if (!categories || categories.length === 0) {
      console.log("No matching categories found");
      // No matching categories found
      return { items: [], total: 0 };
    }
    
    const categoryIds = categories.map(cat => cat.id);
    console.log("Category IDs:", categoryIds);
    
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

    console.log(`Found ${count} items total, returning items ${from}-${to}`);
    
    // Use common formatter to ensure consistency
    const formattedItems = formatNewsItems(previewItems || []);
    
    return {
      items: formattedItems,
      total: count || 0
    };
  };

  return { fetchNewsByCategories };
};
