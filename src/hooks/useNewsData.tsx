
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ARTICLES_PER_PAGE = 8;

export function useNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  // Reset page when search or categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);
  
  // Get total count for pagination
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        console.log("Fetching total count with filters:", { searchQuery, selectedCategories });
        let query = supabase.from('news').select('id', { count: 'exact' });
        
        if (selectedCategories.length > 0) {
          const { data: categoryIds, error: catError } = await supabase
            .from('categories')
            .select('id')
            .in('slug', selectedCategories);
          
          if (catError) {
            console.error("Error fetching category IDs:", catError);
            throw catError;
          }
          
          if (categoryIds && categoryIds.length > 0) {
            const { data: newsIds, error: newsIdError } = await supabase
              .from('news_categories')
              .select('news_id')
              .in('category_id', categoryIds.map(cat => cat.id));
            
            if (newsIdError) {
              console.error("Error fetching news IDs by category:", newsIdError);
              throw newsIdError;
            }
            
            if (newsIds && newsIds.length > 0) {
              query = query.in('id', newsIds.map(item => item.news_id));
            } else {
              // No news with selected categories
              setTotalCount(0);
              return;
            }
          } else {
            // No matching categories
            setTotalCount(0);
            return;
          }
        }
        
        if (searchQuery?.trim()) {
          const searchTerm = `%${searchQuery.toLowerCase()}%`;
          query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
        }
        
        const { count, error: countError } = await query;
        
        if (countError) {
          console.error('Error fetching count:', countError);
          throw countError;
        }
        
        console.log("Total count of articles matching criteria:", count);
        setTotalCount(count || 0);
      } catch (err) {
        console.error("Error in fetchTotalCount:", err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching count'));
      }
    };
    
    fetchTotalCount();
  }, [selectedCategories, searchQuery]);

  // Query for paginated news with filters
  const { data: paginatedNews, isLoading: newsLoading, error: paginatedError } = useQuery({
    queryKey: ['paginated-news', currentPage, selectedCategories, searchQuery],
    queryFn: async () => {
      console.log('Fetching paginated news articles for page:', currentPage);
      
      try {
        // Base query to get articles for current page
        let query = supabase
          .from('news')
          .select(`
            *,
            news_categories(
              category_id,
              categories(*)
            )
          `)
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);
        
        // Add category filtering if needed
        if (selectedCategories.length > 0) {
          console.log("Filtering by categories:", selectedCategories);
          const { data: categoryIds, error: catError } = await supabase
            .from('categories')
            .select('id')
            .in('slug', selectedCategories);
          
          if (catError) {
            console.error("Error fetching category IDs:", catError);
            throw catError;
          }
          
          if (categoryIds && categoryIds.length > 0) {
            const { data: newsIds, error: newsIdError } = await supabase
              .from('news_categories')
              .select('news_id')
              .in('category_id', categoryIds.map(cat => cat.id));
            
            if (newsIdError) {
              console.error("Error fetching news IDs by category:", newsIdError);
              throw newsIdError;
            }
            
            if (newsIds && newsIds.length > 0) {
              query = query.in('id', newsIds.map(item => item.news_id));
            } else {
              // No news with selected categories, return empty array
              console.log("No news found with selected categories");
              return [];
            }
          } else {
            // No matching categories, return empty array
            console.log("No matching categories found");
            return [];
          }
        }
        
        // Add search filtering if needed
        if (searchQuery?.trim()) {
          console.log("Filtering by search query:", searchQuery);
          const searchTerm = `%${searchQuery.toLowerCase()}%`;
          query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
        }

        const { data, error: queryError } = await query;

        if (queryError) {
          console.error("Error executing paginated query:", queryError);
          throw queryError;
        }
        
        console.log("Fetched paginated news articles:", data ? data.length : 0, "items");
        return data || [];
      } catch (err) {
        console.error("Error in fetchPaginatedNews:", err);
        throw err;
      }
    },
    retry: 2,
  });

  // When searching, query all news to allow searching outside current page
  const { data: allNewsForSearch, isLoading: allNewsSearchLoading, error: searchError } = useQuery({
    queryKey: ['all-news-search', searchQuery],
    queryFn: async () => {
      // Only fetch all news when there's a search query
      if (!searchQuery?.trim()) return null;
      
      try {
        console.log('Fetching all news for search: ', searchQuery);
        const { data, error } = await supabase
          .from('news')
          .select('id, title, content, created_at, slug, featured_image')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching all news for search:", error);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} news items for search`);
        return data;
      } catch (err) {
        console.error("Error in allNewsSearch:", err);
        throw err;
      }
    },
    enabled: !!searchQuery?.trim(),
    retry: 1,
  });

  useEffect(() => {
    if (paginatedError) setError(paginatedError instanceof Error ? paginatedError : new Error(String(paginatedError)));
    else if (searchError && searchQuery?.trim()) setError(searchError instanceof Error ? searchError : new Error(String(searchError)));
    else setError(null);
  }, [paginatedError, searchError, searchQuery]);

  // Process search results if needed
  const processedSearchResults = (() => {
    if (!searchQuery?.trim() || !allNewsForSearch) return null;
    
    const query = searchQuery.toLowerCase();
    return allNewsForSearch.filter(article => 
      article.title.toLowerCase().includes(query) || 
      article.content.toLowerCase().includes(query)
    );
  })();

  const isLoading = newsLoading || (searchQuery?.trim() && allNewsSearchLoading);
  
  // Use search results when searching, otherwise use paginated results
  const displayedNews = processedSearchResults || paginatedNews;
  
  // Calculate total pages based on total count or search results
  const totalPages = processedSearchResults 
    ? Math.ceil(processedSearchResults.length / ARTICLES_PER_PAGE)
    : Math.ceil(totalCount / ARTICLES_PER_PAGE);
  
  // Get the current page items
  const currentPageItems = processedSearchResults
    ? processedSearchResults.slice(
        (currentPage - 1) * ARTICLES_PER_PAGE, 
        currentPage * ARTICLES_PER_PAGE
      )
    : displayedNews;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    currentPageItems,
    isLoading,
    error,
    currentPage,
    totalPages,
    handlePageChange
  };
}
