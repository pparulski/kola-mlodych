
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

interface UseOptimizedNewsDataProps {
  searchQuery: string;
  selectedCategories: string[];
  currentPage: number;
  handlePageChange: (newPage: number) => void;
  updateTotalItems: (count: number) => void;
}

export function useOptimizedNewsData({
  searchQuery,
  selectedCategories,
  currentPage,
  handlePageChange,
  updateTotalItems
}: UseOptimizedNewsDataProps) {
  const location = useLocation();
  const previousFilterKey = useRef('');
  const initialLoadCompleted = useRef(false);
  const [totalItems, setLocalTotalItems] = useState(0);
  
  // Import individual hooks
  const { searchNews } = useNewsSearch();
  const { fetchNewsByCategories } = useNewsCategories();
  const { fetchDefaultNews } = useNewsDefault();
  
  // Use the pagination utility (not managing URL anymore)
  const { getPaginationIndices, totalPages } = useNewsPagination(
    currentPage,
    totalItems,
    ARTICLES_PER_PAGE,
    handlePageChange
  );
  
  // Track filter changes
  const filterKey = useMemo(() => {
    return `${searchQuery}-${selectedCategories.sort().join(',')}`; 
  }, [searchQuery, selectedCategories]);

  // When filter key changes, log it
  useEffect(() => {
    if (previousFilterKey.current !== filterKey) {
      console.log("Filter key changed:", filterKey);
      previousFilterKey.current = filterKey;
    }
  }, [filterKey]);

  // Reset totalItems only on pathname change (actual route change)
  useEffect(() => {
    const pathOnly = location.pathname;
    if (initialLoadCompleted.current) {
      console.log(`Path changed to ${pathOnly}, resetting totalItems`);
      setLocalTotalItems(0);
      updateTotalItems(0);
    } else {
      initialLoadCompleted.current = true;
    }
  }, [location.pathname, updateTotalItems]); 

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
        
        // Update total items for pagination
        setLocalTotalItems(result.total);
        updateTotalItems(result.total);
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
    totalPages,
    totalItems: totalItems,
    error
  };
}
