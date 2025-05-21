
import { supabase } from "@/integrations/supabase/client";
import { NewsQueryResult, formatNewsItems, ARTICLES_PER_PAGE } from "./useNewsBase";

// Hook for fetching default news (without filters)
export const useNewsDefault = () => {
  const fetchDefaultNews = async (
    from: number,
    to: number
  ): Promise<NewsQueryResult> => {
    console.log(`Fetching default news with range ${from}-${to}`);
    
    // Use the news_preview view instead of the full news table
    const { data: previewNewsItems, count, error: fetchError } = await supabase
      .from('news_preview')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to);
    
    if (fetchError) {
      throw fetchError;
    }

    console.log(`Default news query returned ${previewNewsItems?.length || 0} items out of ${count}`);

    // Use the common formatter to ensure consistent processing
    const formattedItems = formatNewsItems(previewNewsItems || []);
    
    return {
      items: formattedItems,
      total: count || 0
    };
  };

  return { fetchDefaultNews };
};
