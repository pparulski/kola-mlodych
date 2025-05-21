
import { supabase } from "@/integrations/supabase/client";
import { NewsQueryResult, formatNewsItems, ARTICLES_PER_PAGE } from "./useNewsBase";

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
    console.log(`Searching news with term "${searchTerm}", limit=${limit}, offset=${offset}`);
    
    const { data: rpcResult, error } = await supabase
      .rpc('search_news', {
        search_term: searchTerm,
        page_limit: limit,
        page_offset: offset
      });

    console.log("Search results from RPC (raw):", rpcResult);
    
    if (error) {
      console.error("Detailed error from search_news RPC:", error);
      throw error;
    }

    // Use explicit type assertion to avoid potential undefined issues
    const typedResult = rpcResult as unknown as SearchRpcResult | null;
    
    // Check if we got valid results
    if (!typedResult || !typedResult.items) {
      console.warn("No search results returned from RPC");
      return { items: [], total: 0 };
    }

    // Use the common formatter to ensure consistency
    const formattedItems = formatNewsItems(typedResult.items || []);
    
    console.log(`Search query "${searchTerm}": Found ${typedResult.total || 0} total items, returning ${formattedItems.length} items`);
    
    return {
      items: formattedItems, 
      total: typedResult.total || 0   
    };
  };

  return { searchNews };
};
