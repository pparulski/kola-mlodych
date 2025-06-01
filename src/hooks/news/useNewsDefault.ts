
import { supabase } from "@/integrations/supabase/client";
import { NewsQueryResult, formatNewsItems } from "./useNewsBase";

// Hook for fetching default news (without filters)
export const useNewsDefault = () => {
  const fetchDefaultNews = async (
    from: number,
    to: number
  ): Promise<NewsQueryResult> => {
    console.log(`Fetching default news with range ${from}-${to}`);
    
    // First get the total count for accurate pagination
    const { count, error: countError } = await supabase
      .from('news_preview')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Error getting count of news items:", countError);
      throw countError;
    }
    
    // Use the news_preview view instead of the full news table
    const { data: previewNewsItems, error: fetchError } = await supabase
      .from('news_preview')
      .select('*')
      .order('date', { ascending: false })
      .range(from, to);
    
    if (fetchError) {
      console.error("Error fetching news items:", fetchError);
      throw fetchError;
    }

    console.log(`Default news query: Found ${count || 0} total items, returning ${previewNewsItems?.length || 0} items`);
    
    // Use the common formatter to ensure consistent processing
    const formattedItems = formatNewsItems(previewNewsItems);
    
    return {
      items: formattedItems,
      total: count || 0
    };
  };

  return { fetchDefaultNews };
};
