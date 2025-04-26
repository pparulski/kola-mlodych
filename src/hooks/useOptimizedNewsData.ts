
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ARTICLES_PER_PAGE = 8;

export function useOptimizedNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);

  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ['optimized-news', searchQuery, selectedCategories, currentPage],
    queryFn: async () => {
      console.log('Fetching optimized news: searchQuery=', searchQuery, 'categories=', selectedCategories, 'page=', currentPage);
      
      let query;
      
      if (searchQuery) {
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
        // Start with a query to fetch news_preview data
        query = supabase
          .from('news_preview')
          .select('*')
          .order('date', { ascending: false });
        
        // Apply category filtering if selected
        if (selectedCategories && selectedCategories.length > 0) {
          console.log('Applying category filter with:', selectedCategories);
          
          // Fetch all articles for client-side filtering
          const { data: allArticles, error: fetchError } = await supabase
            .from('news_preview')
            .select('*')
            .order('date', { ascending: false });
            
          if (fetchError) {
            console.error('Error fetching articles for category check:', fetchError);
            throw fetchError;
          }
          
          console.log(`Fetched ${allArticles?.length || 0} total articles`);
          
          // Safely filter articles by selected categories
          const matchingArticles = allArticles?.filter(article => {
            // Skip if article has no categories
            if (!article.category_names || !Array.isArray(article.category_names)) {
              return false;
            }
            
            // Check if any selected category matches any article category
            return selectedCategories.some(selectedCat => {
              if (!selectedCat) return false;
              
              const selectedLower = selectedCat.toLowerCase();
              
              return article.category_names.some((cat: string | null) => {
                // Skip null categories
                if (cat === null || cat === undefined) return false;
                
                // Safe toLowerCase comparison
                return cat.toLowerCase() === selectedLower || 
                       cat.toLowerCase().includes(selectedLower);
              });
            });
          });
          
          console.log(`Filtered and found ${matchingArticles?.length || 0} articles matching categories`);
          
          // Use the filtered results for pagination
          if (matchingArticles && matchingArticles.length > 0) {
            const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
            const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, matchingArticles.length);
            
            return {
              items: matchingArticles.slice(startIndex, endIndex) || [],
              total: matchingArticles.length
            };
          }
          
          // If no matches, return empty array
          return { items: [], total: 0 };
        }
        
        // Without category filtering, fetch paginated results directly
        const { data: countData, error: countError } = await query;
        
        if (countError) {
          console.error('Count query error:', countError);
          throw countError;
        }
        
        const totalCount = countData ? countData.length : 0;
        console.log(`Found ${totalCount} total articles`);
        
        const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
        const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, totalCount);
        const paginatedData = countData ? countData.slice(startIndex, endIndex) : [];
        
        return {
          items: paginatedData || [],
          total: totalCount
        };
      }
    },
    staleTime: 30000, // 30 seconds
    // Add retry configuration to prevent infinite retries on error
    retry: 2,
    retryDelay: 1000,
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
