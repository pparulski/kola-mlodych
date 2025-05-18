
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
    
    // Step 2: Find news articles with those categories
    const { data: newsCategories, error: newsCategoryError } = await supabase
      .from('news_categories')
      .select('news_id')
      .in('category_id', categories.map(cat => cat.id));
      
    if (newsCategoryError) {
      throw newsCategoryError;
    }
    
    if (!newsCategories || newsCategories.length === 0) {
      // No news with these categories
      return { items: [], total: 0 };
    }
    
    // Step 3: Get the actual news articles with pagination
    const newsIds = [...new Set(newsCategories.map(item => item.news_id))];
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .in('id', newsIds);
      
    if (countError) {
      throw countError;
    }
    
    // Get paginated results with full content
    const { data: rawDbNewsItems, error: newsError } = await supabase
      .from('news')
      .select(`
        *,
        news_categories (
          categories ( id, name, slug )
        )
      `)
      .in('id', newsIds)
      .order('date', { ascending: false })
      .range(from, to);
      
    if (newsError) {
      console.error("Error fetching news (category filter):", newsError);
      throw newsError;
    }

    console.log("RAW DB news items (category filter path):", rawDbNewsItems);
    
    return {
      items: formatNewsItems(rawDbNewsItems),
      total: count || 0
    };
  };

  return { fetchNewsByCategories };
};
