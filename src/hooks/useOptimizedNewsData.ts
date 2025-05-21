
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ARTICLES_PER_PAGE } from "./news/useNewsBase";
import { useNewsSearch } from "./news/useNewsSearch";
import { useNewsCategories } from "./news/useNewsCategories";
import { useNewsDefault } from "./news/useNewsDefault";
import { useNewsPagination } from "./news/useNewsPagination";
import { NewsArticle } from "@/types/news";

interface NewsQueryResult {
  items: NewsArticle[];
  total: number;
}

export function useOptimizedNewsData(searchQuery: string, selectedCategories: string[]) {
  const [totalItems, setTotalItems] = useState(0);
  
  // Import individual hooks
  const { searchNews } = useNewsSearch();
  const { fetchNewsByCategories } = useNewsCategories();
  const { fetchDefaultNews } = useNewsDefault();
  const { currentPage, totalPages, handlePageChange, getPaginationIndices } = 
    useNewsPagination(totalItems, ARTICLES_PER_PAGE);
  
  // Track filter changes to reset pagination
  const filterKey = useMemo(() => {
    return `${searchQuery}-${selectedCategories.sort().join(',')}`; 
  }, [searchQuery, selectedCategories]);

  // Reset to page 1 when search query or categories change
  useEffect(() => {
    console.log("Filter key changed, resetting pagination:", filterKey);
  }, [filterKey]);

  // Query for news data with server-side pagination and filtering
  const { data: newsData, isLoading, error } = useQuery<NewsQueryResult>({
    queryKey: ['optimized-news', searchQuery, selectedCategories, currentPage],
    queryFn: async () => {
      const { from, to } = getPaginationIndices();
      
      let result: NewsQueryResult;
      console.log("Fetching news with params:", { 
        searchQuery, 
        selectedCategories, 
        currentPage, 
        from, 
        to 
      });
      
      try {
        // Handle search queries with the search_news function
        if (searchQuery) {
          console.log("Using search news flow");
          result = await searchNews(searchQuery, ARTICLES_PER_PAGE, from);
        }
        // Server-side filtering and pagination for category filters
        else if (selectedCategories && selectedCategories.length > 0) {
          console.log("Using category filter flow");
          result = await fetchNewsByCategories(selectedCategories, from, to);
        }
        // Standard pagination without filters
        else {
          console.log("Using default news flow");
          result = await fetchDefaultNews(from, to);
        }
        
        console.log("Query result:", {
          totalItems: result.total,
          itemsCount: result.items.length
        });
        
        // Update total items for pagination
        setTotalItems(result.total);
        return result;
      } catch (error) {
        console.error("Error fetching news data:", error);
        throw error;
      }
    },
    staleTime: 10000, // Shorter stale time to refresh data more frequently
    gcTime: 30000, // Keep in cache for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Memoize the current page items to prevent unnecessary re-renders
  const currentPageItems = useMemo(() => newsData?.items || [], [newsData?.items]);

  return {
    currentPageItems,
    isLoading,
    currentPage,
    totalPages,
    handlePageChange,
    totalItems: totalItems,
    error
  };
}
