
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ARTICLES_PER_PAGE = 8;

export function useOptimizedNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const isFirstRenderRef = useRef(true);

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
      
      // Start with base query
      let query = supabase.from('news_preview').select('*', { count: 'exact' });
      
      // Apply category filtering if needed
      if (selectedCategories && selectedCategories.length > 0) {
        // Using a server function would be ideal here, but as a workaround
        // we'll fetch all matching articles and paginate client-side
        const { data: allArticles, error: fetchError } = await supabase
          .from('news_preview')
          .select('*')
          .order('date', { ascending: false });
            
        if (fetchError) {
          console.error('Error fetching articles for category check:', fetchError);
          throw fetchError;
        }
        
        // Filter articles by selected category slugs
        const filteredArticles = allArticles?.filter(article => {
          if (!article.category_names || !Array.isArray(article.category_names)) {
            return false;
          }
          
          return selectedCategories.some(selectedCat => {
            if (!selectedCat) return false;
            
            const selectedLower = selectedCat.toLowerCase();
            
            return article.category_names.some((categoryName: string | null) => {
              if (!categoryName) return false;
              
              const categoryNameLower = categoryName.toLowerCase();
              const slugLike = categoryNameLower.replace(/\s+/g, '-');
              
              return selectedLower === slugLike || 
                     selectedLower === categoryNameLower || 
                     categoryNameLower.includes(selectedLower);
            });
          });
        }) || [];
        
        // Client-side pagination for filtered results
        const total = filteredArticles.length;
        const paginatedItems = filteredArticles.slice(from, from + ARTICLES_PER_PAGE);
        
        return {
          items: paginatedItems,
          total
        };
      }
      
      // Server-side pagination for standard queries
      const { data, count, error: fetchError } = await query
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

  // Reset to page 1 when filters change
  if (!isFirstRenderRef.current && (searchQuery || selectedCategories.length > 0)) {
    // Only reset page on subsequent renders when filters change
    setCurrentPage(1);
  }
  
  // Mark first render as complete
  if (isFirstRenderRef.current) {
    isFirstRenderRef.current = false;
  }

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
