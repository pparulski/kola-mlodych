
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
        // Use the news_preview view for regular browsing
        query = supabase
          .from('news_preview')
          .select('*');
        
        // Filter by categories only if there are selected categories with actual values
        if (selectedCategories && selectedCategories.length > 0) {
          console.log('Applying category filter with:', selectedCategories);
          // Use overlaps operator to check if any selected category is in the article's categories
          query = query.overlaps('category_ids', selectedCategories);
        } else {
          console.log('No category filters applied, fetching all articles');
        }
        
        // Fetch all matches to calculate total count
        const { data: countData, error: countError } = await query;
        
        if (countError) {
          console.error('Count query error:', countError);
          throw countError;
        }
        
        const totalCount = countData ? countData.length : 0;
        console.log(`Found ${totalCount} total articles`);
        
        // Then get paginated data using client-side pagination
        const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
        const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, totalCount);
        const paginatedData = countData ? countData.slice(startIndex, endIndex) : [];
        
        console.log(`Fetched ${paginatedData.length} articles for current page (${startIndex}-${endIndex})`);
        
        // Debug the actual data structure we're receiving
        if (paginatedData && paginatedData.length > 0) {
          console.log('First article sample:', paginatedData[0]);
        } else {
          console.log('No articles in current page slice.');
        }
        
        return {
          items: paginatedData || [],
          total: totalCount
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
