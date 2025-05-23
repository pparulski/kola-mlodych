
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const previousFilterKey = useRef('');
  
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

  // Note filter key changes but don't reset anything here
  useEffect(() => {
    if (previousFilterKey.current !== filterKey) {
      console.log("Filter key changed, resetting pagination:", filterKey);
      previousFilterKey.current = filterKey;
    }
  }, [filterKey]);

  // Reset totalItems only on pathname change (actual route change), not on search param changes
  useEffect(() => {
    const pathOnly = location.pathname;
    setTotalItems(0);
  }, [location.pathname]); // Only dependent on pathname, not full location

  // Query for news data with server-side pagination and filtering
  const { data: newsData, isLoading, error } = useQuery<NewsQueryResult>({
    queryKey: ['optimized-news', searchQuery, selectedCategories, currentPage, location.pathname],
    queryFn: async () => {
      const { from, to } = getPaginationIndices();
      
      let result: NewsQueryResult;
      console.log("Fetching news with params:", { 
        searchQuery, 
        selectedCategories, 
        currentPage, 
        from, 
        to,
        pathname: location.pathname 
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
    staleTime: 10000,
    gcTime: 30000,
    refetchOnWindowFocus: false,
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
