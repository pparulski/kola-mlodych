
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ARTICLES_PER_PAGE = 8;

export function useOptimizedNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const isLoggedRef = useRef<boolean>(false);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);

  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ['optimized-news', searchQuery, selectedCategories, currentPage],
    queryFn: async () => {
      // Only log on first render or when inputs change
      if (!isLoggedRef.current) {
        console.log('Fetching optimized news: searchQuery=', searchQuery, 'categories=', selectedCategories, 'page=', currentPage);
        isLoggedRef.current = true;
      }
      
      let query;
      
      if (searchQuery) {
        const { data, error } = await supabase
          .rpc('search_news', { search_term: searchQuery });
          
        if (error) {
          console.error('Search error:', error);
          throw error;
        }
        
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
          // Fetch all articles for client-side filtering
          const { data: allArticles, error: fetchError } = await supabase
            .from('news_preview')
            .select('*')
            .order('date', { ascending: false });
            
          if (fetchError) {
            console.error('Error fetching articles for category check:', fetchError);
            throw fetchError;
          }
          
          // Safely filter articles by selected category slugs
          const matchingArticles = allArticles?.filter(article => {
            // Skip if article has no categories
            if (!article.category_names || !Array.isArray(article.category_names)) {
              return false;
            }
            
            // We need to check if any of the article's categories match any selected category
            // Since category_names is an array of names and not slugs, we need to do a fuzzy match
            return selectedCategories.some(selectedCat => {
              if (!selectedCat) return false;
              
              const selectedLower = selectedCat.toLowerCase();
              
              // Try to match by converting category names to slug-like format
              return article.category_names.some((categoryName: string | null) => {
                if (!categoryName) return false;
                
                // Generate a slug-like string from the category name
                const categoryNameLower = categoryName.toLowerCase();
                const slugLike = categoryNameLower.replace(/\s+/g, '-');
                
                // Compare the generated slug with the selected category slug
                return selectedLower === slugLike || 
                       selectedLower === categoryNameLower || 
                       categoryNameLower.includes(selectedLower);
              });
            });
          }) || [];
          
          // Use the filtered results for pagination
          const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
          const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, matchingArticles.length);
          
          return {
            items: matchingArticles.slice(startIndex, endIndex),
            total: matchingArticles.length
          };
        }
        
        // Without category filtering, fetch paginated results directly
        const { data: countData, error: countError } = await query;
        
        if (countError) {
          console.error('Count query error:', countError);
          throw countError;
        }
        
        const totalCount = countData ? countData.length : 0;
        
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
    retry: 1,
    retryDelay: 1000,
  });

  const totalPages = Math.ceil((newsData?.total || 0) / ARTICLES_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Reset the log flag when page changes to allow one log on the new page
      isLoggedRef.current = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Conditionally log status info only on initial render
  useEffect(() => {
    const logStatus = {
      isLoading,
      hasError: !!error,
      itemCount: newsData?.items?.length || 0,
      totalArticles: newsData?.total || 0,
      currentPage,
      totalPages,
    };
    
    // Log once on mount/update
    console.log('News data status:', logStatus);
    
    // Cleanup function that runs on unmount/before next effect
    return () => {
      isLoggedRef.current = false;
    };
  }, [newsData, isLoading, error, currentPage, totalPages]);

  return {
    currentPageItems: newsData?.items || [],
    isLoading,
    currentPage,
    totalPages,
    handlePageChange,
    error
  };
}
