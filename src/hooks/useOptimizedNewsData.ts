
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ARTICLES_PER_PAGE = 8;

export function useOptimizedNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Reset page when search or categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);

  // Query using the optimized view and search function
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['optimized-news', searchQuery, selectedCategories, currentPage],
    queryFn: async () => {
      let query;
      
      if (searchQuery) {
        // Use the optimized search function for text search
        const { data, error } = await supabase
          .rpc('search_news', { search_term: searchQuery });
          
        if (error) throw error;
        return {
          items: data.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE),
          total: data.length
        };
      } else {
        // Use the optimized news_preview view
        query = supabase
          .from('news_preview')
          .select('*')
          .order('date', { ascending: false, nullsFirst: false });
        
        if (selectedCategories.length > 0) {
          query = query.filter('category_ids', 'cs', `{${selectedCategories.join(',')}}`);
        }
        
        // Get total count
        const { count, error: countError } = await query.count();
        if (countError) throw countError;
        
        // Get paginated data
        const { data, error } = await query
          .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);
          
        if (error) throw error;
        
        return {
          items: data,
          total: count
        };
      }
    },
  });

  const totalPages = Math.ceil((newsData?.total || 0) / ARTICLES_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    currentPageItems: newsData?.items || [],
    isLoading,
    currentPage,
    totalPages,
    handlePageChange
  };
}
