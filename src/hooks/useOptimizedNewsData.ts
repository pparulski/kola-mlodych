
import { useState, useEffect, useMemo, useRef } from "react";

// Module-level cache to persist totals across unmounts (e.g., navigating to article and back)
const STICKY_TOTALS: Record<string, number> = {};
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
  const [totalItems, setTotalItems] = useState<number>(STICKY_TOTALS['-'] ?? 0);
  // Sticky total per filterKey to avoid collapsing total during route transitions
  const lastTotalByFilterKey = useRef<Record<string, number>>({});
  const location = useLocation();
  const previousFilterKey = useRef('');
  const initialLoadCompleted = useRef(false);
  
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

  // Initialize total from module-level sticky cache for this filterKey
  useEffect(() => {
    if (STICKY_TOTALS[filterKey] !== undefined) {
      setTotalItems(STICKY_TOTALS[filterKey]);
      console.log(`useOptimizedNewsData: initialized total from STICKY_TOTALS for filterKey=${filterKey}: ${STICKY_TOTALS[filterKey]}`);
    }
  }, [filterKey]);

  // When filter key changes, reset pagination to page 1 to avoid fetching with old page ranges
  useEffect(() => {
    if (previousFilterKey.current !== filterKey) {
      console.log("Filter key changed, resetting pagination:", filterKey);
      previousFilterKey.current = filterKey;
      // Reset page to 1 immediately to prevent out-of-range fetch with old page value
      handlePageChange(1);
    }
  }, [filterKey, handlePageChange]);

  // Do not reset totalItems on pathname change; preserve for proper back navigation
  // Keeping totalItems intact prevents unintended page resets
  useEffect(() => {
    if (!initialLoadCompleted.current) {
      initialLoadCompleted.current = true;
    }
  }, [location.pathname]);

  // Log totalItems whenever it changes for debug
  useEffect(() => {
    console.log(`useOptimizedNewsData: totalItems now ${totalItems} for filterKey=${filterKey}`);
  }, [totalItems, filterKey]);

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
          
          // Log which categories we're filtering by for debugging
          console.log(`Fetching news by categories: ${selectedCategories.join(", ")} with range ${from}-${to}`);
          
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
        
        // Update total items for pagination with sticky behavior per filterKey
        if (typeof result.total === 'number' && result.total >= 0) {
          lastTotalByFilterKey.current[filterKey] = result.total;
          STICKY_TOTALS[filterKey] = result.total;
          setTotalItems(result.total);
          console.log(`useOptimizedNewsData: setTotalItems(${result.total}) for filterKey=${filterKey}`);
        } else if (lastTotalByFilterKey.current[filterKey] !== undefined) {
          const sticky = lastTotalByFilterKey.current[filterKey];
          setTotalItems(sticky);
          console.log(`useOptimizedNewsData: reusing sticky total ${sticky} for filterKey=${filterKey}`);
        }
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
