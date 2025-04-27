
import { useState, useEffect } from "react";
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

        if (error) {
          throw error;
        }

        // === FIX 1: USE 'unknown' CAST ===
        const typedResult = rpcResult as unknown as SearchRpcResult | null;

        // === FIX 2: ACCESS PROPERTIES VIA 'typedResult' ===
        return {
          items: typedResult?.items || [], // Use typedResult here
          total: typedResult?.total || 0   // Use typedResult here
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
          .from('news_preview')
          .select('*', { count: 'exact' })
          .in('id', newsIds);
          
        if (countError) {
          throw countError;
        }
        
        // Get paginated results
        const { data: newsItems, error: newsError } = await supabase
          .from('news_preview')
          .select('*')
          .in('id', newsIds)
          .order('date', { ascending: false })
          .range(from, to);
          
        if (newsError) {
          throw newsError;
        }
        
        return {
          items: newsItems || [],
          total: count || 0
        };
      }
      
      // Standard pagination without filters
      const { data, count, error: fetchError } = await supabase
        .from('news_preview')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);
      
      if (fetchError) {
        throw fetchError;
      }
      
      return {
        items: data || [],
        total: count || 0
      };
    },
    staleTime: 30000,
    retry: 1,
    retryDelay: 1000,
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
    handlePageChange,
    error
  };
}
