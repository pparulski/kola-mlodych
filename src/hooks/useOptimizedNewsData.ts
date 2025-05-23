
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ARTICLES_PER_PAGE } from "./news/useNewsBase";
import { useNewsSearch } from "./news/useNewsSearch";
import { useNewsCategories } from "./news/useNewsCategories";
import { useNewsDefault } from "./news/useNewsDefault";
import { useEnhancedSearchParams } from "./useEnhancedSearchParams";
import { NewsArticle } from "@/types/news";

interface NewsQueryResult {
  items: NewsArticle[];
  total: number;
}

export function useOptimizedNewsData() {
  // Get all params from our enhanced hook
  const {
    searchQuery,
    selectedCategories,
    currentPage,
    totalPages,
    setCurrentPage,
    setTotal,
    getPaginationIndices
  } = useEnhancedSearchParams();
  
  // Import individual data fetching hooks
  const { searchNews } = useNewsSearch();
  const { fetchNewsByCategories } = useNewsCategories();
  const { fetchDefaultNews } = useNewsDefault();

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
        // Handle search queries
        if (searchQuery) {
          console.log("Using search news flow");
          result = await searchNews(searchQuery, ARTICLES_PER_PAGE, from);
        }
        // Server-side filtering and pagination for category filters
        else if (selectedCategories && selectedCategories.length > 0) {
          console.log("Using category filter flow");
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
        
        // Update total items for pagination in the enhanced hook
        setTotal(result.total, ARTICLES_PER_PAGE);
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
  
  // Get the total count for display
  const totalItems = newsData?.total || 0;

  return {
    currentPageItems,
    isLoading,
    currentPage,
    totalPages,
    handlePageChange: setCurrentPage,
    totalItems,
    error
  };
}
