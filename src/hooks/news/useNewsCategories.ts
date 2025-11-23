
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
    
    // Step 2: First get the total count of all matching articles
    const { count: totalCount, error: countError } = await supabase
      .from('news_preview')
      .select('*', { count: 'exact', head: true })
      .overlaps('category_ids', categoryIds);
    
    if (countError) {
      console.error("Error getting total count:", countError);
      throw countError;
    }
    
    // Step 3: Query the news_preview view with category filtering and pagination
    const { data: previewItems, error: previewError } = await supabase
      .from('news_preview')
      .select('*')
      .overlaps('category_ids', categoryIds)
      .order('date', { ascending: false })
      .range(from, to);
      
    if (previewError) {
      console.error("Error fetching news previews by categories:", previewError);
      throw previewError;
    }

    console.log(`Category filter query: Found ${totalCount || 0} total items, returning ${previewItems?.length || 0} items`);
    
    // Use common formatter to ensure consistency
    const formattedItems = formatNewsItems(previewItems || []);
    
    return {
      items: formattedItems,
      total: totalCount || 0
    };
  };

  return { fetchNewsByCategories };
};
