
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
      
      // STEP 1: First fetch some sample data to debug category names structure
      if (selectedCategories && selectedCategories.length > 0) {
        // Let's first look at the actual data to understand the structure
        const { data: sampleData } = await supabase
          .from('news_preview')
          .select('*')
          .limit(5);
        
        console.log('Sample news_preview data to check category_names structure:', 
          sampleData?.map(item => ({
            id: item.id,
            title: item.title,
            category_names: item.category_names
          }))
        );
      }
      
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
        query = supabase
          .from('news_preview')
          .select('*')
          .order('date', { ascending: false });
        
        if (selectedCategories && selectedCategories.length > 0) {
          console.log('Applying category filter with:', selectedCategories);
          
          // Try a different approach by using "ilike" to match individual items
          // In case the category_names array contains full names instead of slugs
          selectedCategories.forEach((category, index) => {
            query = query.or(`category_names.ilike.%${category}%`);
          });
        } else {
          console.log('No category filters applied, fetching all articles');
        }
        
        const { data: countData, error: countError } = await query;
        
        if (countError) {
          console.error('Count query error:', countError);
          throw countError;
        }
        
        const totalCount = countData ? countData.length : 0;
        console.log(`Found ${totalCount} total articles`);
        
        if (selectedCategories && selectedCategories.length > 0 && totalCount === 0) {
          console.log('No articles found with selected categories. Trying alternative matching approach...');
          
          // Try a different approach as a fallback
          const { data: alternativeData } = await supabase
            .from('news_preview')
            .select('*')
            .order('date', { ascending: false });
            
          // Filter client-side to inspect what's happening
          const filteredData = alternativeData?.filter(item => {
            if (!item.category_names) return false;
            
            // Log each article and its categories for debugging
            console.log(`Article "${item.title}" has categories:`, item.category_names);
            
            // Check if any of the selected categories matches any of the article's categories
            return selectedCategories.some(selectedCat => 
              item.category_names && item.category_names.some((cat: string) => 
                cat.toLowerCase().includes(selectedCat.toLowerCase())
              )
            );
          });
          
          console.log(`Alternative filtering found ${filteredData?.length || 0} articles`);
          
          if (filteredData && filteredData.length > 0) {
            const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
            const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, filteredData.length);
            
            return {
              items: filteredData.slice(startIndex, endIndex) || [],
              total: filteredData.length
            };
          }
        }
        
        const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
        const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, totalCount);
        const paginatedData = countData ? countData.slice(startIndex, endIndex) : [];
        
        return {
          items: paginatedData || [],
          total: totalCount
        };
      }
    },
    staleTime: 30000, // Increase staleTime to prevent excessive refetching
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
