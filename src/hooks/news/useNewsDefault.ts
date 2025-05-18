
import { supabase } from "@/integrations/supabase/client";
import { NewsQueryResult, formatNewsItems } from "./useNewsBase";

// Hook for fetching default news (without filters)
export const useNewsDefault = () => {
  const fetchDefaultNews = async (
    from: number,
    to: number
  ): Promise<NewsQueryResult> => {
    const { data: rawDefaultNewsItems, count, error: fetchError } = await supabase
      .from('news')
      .select(`
        *,
        news_categories (
          categories ( id, name, slug )
        )
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to);
    
    if (fetchError) {
      throw fetchError;
    }

    console.log("RAW DB default news items (no filters):", rawDefaultNewsItems);

    return {
      items: formatNewsItems(rawDefaultNewsItems),
      total: count || 0
    };
  };

  return { fetchDefaultNews };
};
