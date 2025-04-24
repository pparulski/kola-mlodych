
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ARTICLES_PER_PAGE = 8;

export function useOptimizedNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset page when search or categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);

  // Query using the optimized view and search function
  const { data: newsData, isLoading, error } = useQuery({
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
        // Use the news_preview view for regular browsing, always fetch with count
        query = supabase
          .from('news_preview')
          .select('*', { count: 'exact' });
        
        // Filter by categories only if there are selected categories with actual values
        if (selectedCategories && selectedCategories.length > 0) {
          console.log('Applying category filter with:', selectedCategories);
          // Use overlaps operator to check if any selected category is in the article's categories
          query = query.overlaps('category_ids', selectedCategories);
        } else {
          console.log('No category filters applied, fetching all articles');
        }
        
        // First get total count for pagination
        const { count, error: countError } = await query.count();
        
        if (countError) {
          console.error('Count error:', countError);
          throw countError;
        }
        
        console.log(`Found ${count} total articles`);
        
        // Then get paginated data
        const { data, error } = await query
          .order('date', { ascending: false, nullsFirst: false })
          .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);
          
        if (error) {
          console.error('Data fetch error:', error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} articles for current page:`, data);
        
        // Debug the actual data structure we're receiving
        if (data && data.length > 0) {
          console.log('First article sample:', data[0]);
        }
        
        return {
          items: data || [],
          total: count || 0
        };
      }
    },
    staleTime: 0, // Don't cache results to ensure fresh data
  });

  const totalPages = Math.ceil((newsData?.total || 0) / ARTICLES_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  console.log('News data status:', {
    isLoading,
    hasError: !!error,
    itemCount: newsData?.items?.length || 0,
    totalArticles: newsData?.total || 0,
    currentPage,
    totalPages,
  });

  return {
    currentPageItems: newsData?.items || [],
    isLoading,
    currentPage,
    totalPages,
    handlePageChange,
    error
  };
}
