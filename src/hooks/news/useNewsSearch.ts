
import { supabase } from "@/integrations/supabase/client";
import { NewsQueryResult, formatNewsItems } from "./useNewsBase";

// Define search RPC result type
export interface SearchRpcResult {
  items: any[] | null; 
  total: number | null;
}

// Hook for searching news articles
export const useNewsSearch = () => {
  const searchNews = async (
    searchTerm: string,
    limit: number,
    offset: number
  ): Promise<NewsQueryResult> => {
    const { data: rpcResult, error } = await supabase
      .rpc('search_news', {
        search_term: searchTerm,
        page_limit: limit,
        page_offset: offset
      });

    console.log("Search results from RPC:", rpcResult);
    
    if (error) {
      console.error("Detailed error from search_news RPC:", error);
      throw error;
    }

    // Use explicit type assertion to avoid potential undefined issues
    const typedResult = rpcResult as unknown as SearchRpcResult | null;

    // The search RPC already returns items with preview_content and category_names
    return {
      items: formatNewsItems(typedResult?.items || []), 
      total: typedResult?.total || 0   
    };
  };

  return { searchNews };
};
