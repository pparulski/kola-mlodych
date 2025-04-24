
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
      console.log('Fetching optimized news: searchQuery=', searchQuery, 'categories=', selectedCategories, 'page=', currentPage);
      
      let query;
      
      if (searchQuery) {
        // Use the optimized search function for text search
        const { data, error } = await supabase
          .rpc('search_news', { search_term: searchQuery });
          
        if (error) {
          console.error('Search error:', error);
          throw error;
        }
        
        console.log(`Search found ${data?.length || 0} results`);
        
        return {
          items: data?.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE) || [],
          total: data?.length || 0
        };
      } else {
        // Use the optimized news_preview view
        query = supabase
          .from('news_preview')
          .select('*');
        
        if (selectedCategories.length > 0) {
          // When filtering by categories, we need to check if any category_id in the array matches
          // Using containedBy to check if any of the selected categories is in the article's categories
          query = query.contains('category_ids', selectedCategories);
        }
        
        // Get total count for pagination
        const { count, error: countError } = await query.count();
        if (countError) {
          console.error('Count error:', countError);
          throw countError;
        }
        
        console.log(`Found ${count} total articles`);
        
        // Order results by date, then get paginated data
        const { data, error } = await query
          .order('date', { ascending: false, nullsFirst: false })
          .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);
          
        if (error) {
          console.error('Data fetch error:', error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} articles for current page`);
        
        return {
          items: data || [],
          total: count || 0
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
