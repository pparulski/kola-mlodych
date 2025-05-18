
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define near the top of useOptimizedNewsData.ts or in a shared types file
import { NewsArticle } from '@/types/news'; // Assuming you have a NewsArticle type

interface SearchRpcResult {
  items: NewsArticle[] | null; // Allow null if json_agg returns null
  total: number | null;       // Allow null if count returns null
}

const ARTICLES_PER_PAGE = 8;

export function useOptimizedNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset to page 1 when search query or categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);

  // Query for news data with server-side pagination and filtering
  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ['optimized-news', searchQuery, selectedCategories, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ARTICLES_PER_PAGE;
      const to = from + ARTICLES_PER_PAGE - 1;
      
      // Handle search queries with the search_news function
      if (searchQuery) {
        const limit = ARTICLES_PER_PAGE;
        const offset = (currentPage - 1) * ARTICLES_PER_PAGE;

        const { data: rpcResult, error } = await supabase
          .rpc('search_news', {
            search_term: searchQuery,
            page_limit: limit,
            page_offset: offset
           });

        console.log("RAW rpcResult from search_news:", rpcResult);
        console.log("Error from search_news RPC (if any):", error); // Also log the error

        if (error) {
          console.error("Detailed error from search_news RPC:", error);
          throw error;
        }

        // Use explicit type assertion to avoid potential undefined issues
        const typedResult = rpcResult as unknown as SearchRpcResult | null;

        return {
          items: typedResult?.items || [], 
          total: typedResult?.total || 0   
        };
      }
      
      // Server-side filtering and pagination for category filters
      if (selectedCategories && selectedCategories.length > 0) {
        // Step 1: Get category IDs from slugs
        const { data: categories, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .in('slug', selectedCategories);
          
        if (categoryError) {
          throw categoryError;
        }
        
        if (!categories || categories.length === 0) {
          // No matching categories found
          return { items: [], total: 0 };
        }
        
        // Step 2: Find news articles with those categories
        const { data: newsCategories, error: newsCategoryError } = await supabase
          .from('news_categories')
          .select('news_id')
          .in('category_id', categories.map(cat => cat.id));
          
        if (newsCategoryError) {
          throw newsCategoryError;
        }
        
        if (!newsCategories || newsCategories.length === 0) {
          // No news with these categories
          return { items: [], total: 0 };
        }
        
        // Step 3: Get the actual news articles with pagination
        const newsIds = [...new Set(newsCategories.map(item => item.news_id))];
        
        // Get total count
        const { count, error: countError } = await supabase
          .from('news')  // Using news table instead of news_preview
          .select('*', { count: 'exact', head: true })
          .in('id', newsIds);
          
        if (countError) {
          throw countError;
        }
        
        // Get paginated results with full content
        const { data: rawDbNewsItems, error: newsError } = await supabase
          .from('news')  // Using news table instead of news_preview
          .select(`
            *,
            news_categories (
              categories ( id, name, slug )
            )
          `)
          .in('id', newsIds)
          .order('date', { ascending: false })
          .range(from, to);
          
        if (newsError) {
          console.error("Error fetching news (category filter):", newsError);
          throw newsError;
        }

        console.log("RAW DB news items (category filter path):", rawDbNewsItems);
        
        // Process rawNewsItems to extract and flatten category_names
        const itemsWithFlatCategories = (rawDbNewsItems || []).map(item => {
          const categoryNames = item.news_categories?.map(
            (nc: any) => nc.categories?.name
          ).filter((name): name is string => name !== null && name !== undefined && name !== "") || [];
          
          const { news_categories, ...restOfItem } = item; // Destructure to remove original nested field

          return {
            ...restOfItem,
            category_names: categoryNames
          };
        });

        console.log("Processed items with flat categories (category filter path):", itemsWithFlatCategories);

        return {
          items: itemsWithFlatCategories,
          total: count || 0
        };
      }
      
      // Standard pagination without filters - use news table to get content
      const { data: rawDefaultNewsItems, count, error: fetchError } = await supabase
        .from('news')  // Using news table instead of news_preview
        .select(`
          *,
          news_categories (
            categories ( id, name, slug )
          )
        `, { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);
      
      if (fetchError) {
        throw fetchError;
      }

      console.log("RAW DB default news items (no filters):", rawDefaultNewsItems);

      // Process rawDefaultNewsItems to extract and flatten category_names
      const defaultItemsWithFlatCategories = (rawDefaultNewsItems || []).map(item => {
        const categoryNames = item.news_categories?.map(
          (nc: any) => nc.categories?.name
        ).filter((name): name is string => name !== null && name !== undefined && name !== "") || [];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { news_categories, ...restOfItem } = item;

        return {
          ...restOfItem,
          category_names: categoryNames
        };
      });

      console.log("Processed default items with flat categories (no filters):", defaultItemsWithFlatCategories);

      return {
        items: defaultItemsWithFlatCategories,
        total: count || 0
      };
    },
    staleTime: 30000,
    retry: 1,
    retryDelay: 1000,
  });

  const totalPages = Math.ceil((newsData?.total || 0) / ARTICLES_PER_PAGE);

  // Memoize the current page items to prevent unnecessary re-renders
  const currentPageItems = useMemo(() => newsData?.items || [], [newsData?.items]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  return {
    currentPageItems,
    isLoading,
    currentPage,
    totalPages,
    handlePageChange,
    error
  };
}
