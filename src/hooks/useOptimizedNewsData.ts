
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ARTICLES_PER_PAGE = 8;

export function useOptimizedNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset to page 1 when search query or categories change (in useEffect, not directly)
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);

  // Query for news data with server-side pagination and filtering
  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ['optimized-news', searchQuery, selectedCategories, currentPage],
    queryFn: async () => {
      console.log('Fetching page:', currentPage, 'with categories:', selectedCategories, 'search:', searchQuery);
      
      const from = (currentPage - 1) * ARTICLES_PER_PAGE;
      const to = from + ARTICLES_PER_PAGE - 1;
      
      // Handle search queries with the search_news function
      if (searchQuery) {
        const { data, error } = await supabase
          .rpc('search_news', { search_term: searchQuery });
          
        if (error) {
          console.error('Search error:', error);
          throw error;
        }
        
        // Client-side pagination for search results
        const total = data?.length || 0;
        const paginatedItems = data?.slice(from, from + ARTICLES_PER_PAGE) || [];
        
        return {
          items: paginatedItems,
          total
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
          console.error('Error fetching categories:', categoryError);
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
          console.error('Error fetching news categories:', newsCategoryError);
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
          console.error('Error getting count:', countError);
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
          console.error('Error fetching news:', newsError);
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
        console.error('Fetch error:', fetchError);
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
