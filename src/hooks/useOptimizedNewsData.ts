
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
      
      // STEP 1: First fetch one sample article to debug category structure
      if (selectedCategories && selectedCategories.length > 0) {
        console.log('DEBUG: Fetching sample article to inspect category_names structure');
        const { data: sampleArticle } = await supabase
          .from('news_preview')
          .select('*')
          .limit(1);
          
        if (sampleArticle && sampleArticle.length > 0) {
          console.log('Sample article category_names structure:', sampleArticle[0].category_names);
          console.log('Full sample article:', sampleArticle[0]);
        } else {
          console.log('No sample article found');
        }
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
          
          // Try multiple different approaches to match categories correctly
          
          // Approach 1: Using direct array contains
          // This works if category_names is an array of slugs
          query = query.contains('category_names', selectedCategories);
          
          // Fallback approach if the above fails: Try a scan with ilike on each article server-side
          const { data: allArticles, error: scanError } = await supabase
            .from('news_preview')
            .select('*')
            .order('date', { ascending: false });
            
          if (scanError) {
            console.error('Error fetching articles for category check:', scanError);
            throw scanError;
          }
          
          console.log(`Fetched ${allArticles?.length || 0} total articles`);
          
          // Manually filter articles where any category slug matches any of the selected categories
          const matchingArticles = allArticles?.filter(article => {
            // Skip if article has no categories
            if (!article.category_names || !Array.isArray(article.category_names)) {
              return false;
            }
            
            // For debugging
            console.log(`Article "${article.title}" has categories:`, article.category_names);
            
            // Check if any selected category is in the article's categories
            // This handles both exact matches and partial matches
            const matches = selectedCategories.some(selectedCat => {
              return article.category_names.some((cat: string) => {
                // Try to match either the slug or name
                const catLower = cat.toLowerCase();
                const selectedLower = selectedCat.toLowerCase();
                
                // Check for matches
                const isMatch = catLower === selectedLower || catLower.includes(selectedLower);
                
                if (isMatch) {
                  console.log(`Match found! Article "${article.title}" category "${cat}" matches selected "${selectedCat}"`);
                }
                
                return isMatch;
              });
            });
            
            return matches;
          });
          
          console.log(`Manually filtered and found ${matchingArticles?.length || 0} articles matching categories`, selectedCategories);
          
          // If we found articles with the client-side filtering, use those results
          if (matchingArticles && matchingArticles.length > 0) {
            const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
            const endIndex = Math.min(startIndex + ARTICLES_PER_PAGE, matchingArticles.length);
            
            return {
              items: matchingArticles.slice(startIndex, endIndex) || [],
              total: matchingArticles.length
            };
          }
        } else {
          console.log('No category filters applied, fetching all articles');
        }
        
        // If we reach here, either:
        // 1. No categories were selected, or
        // 2. The client-side filtering didn't find results, fall back to original query
        
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
