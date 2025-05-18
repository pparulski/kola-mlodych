
import { supabase } from "@/integrations/supabase/client";
import { NewsQueryResult, formatNewsItems } from "./useNewsBase";

// Hook for fetching default news (without filters)
export const useNewsDefault = () => {
  const fetchDefaultNews = async (
    from: number,
    to: number
  ): Promise<NewsQueryResult> => {
    // Use the news_preview view instead of the full news table
    const { data: previewNewsItems, count, error: fetchError } = await supabase
      .from('news_preview')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to);
    
    if (fetchError) {
      throw fetchError;
    }

    console.log("Preview news items from view:", previewNewsItems);

    return {
      items: formatNewsItems(previewNewsItems),
      total: count || 0
    };
  };

  return { fetchDefaultNews };
};
