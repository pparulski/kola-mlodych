
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ARTICLES_PER_PAGE = 8;

export function useNewsData(searchQuery: string, selectedCategories: string[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Reset page when search or categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);
  
  // Get total count for pagination
  useEffect(() => {
    const fetchTotalCount = async () => {
      let query = supabase.from('news').select('id', { count: 'exact' });
      
      if (selectedCategories.length > 0) {
        const { data: categoryIds } = await supabase
          .from('categories')
          .select('id')
          .in('slug', selectedCategories);
        
        if (categoryIds && categoryIds.length > 0) {
          const { data: newsIds } = await supabase
            .from('news_categories')
            .select('news_id')
            .in('category_id', categoryIds.map(cat => cat.id));
          
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
      
      const { count, error } = await query;
      
      if (error) {
        console.error('Error fetching count:', error);
        return;
      }
      
      setTotalCount(count || 0);
    };
    
    fetchTotalCount();
  }, [selectedCategories, searchQuery]);

  // Query for paginated news with filters
  const { data: paginatedNews, isLoading: newsLoading } = useQuery({
    queryKey: ['paginated-news', currentPage, selectedCategories, searchQuery],
    queryFn: async () => {
      console.log('Fetching paginated news articles for page:', currentPage);
      
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
        const { data: categoryIds } = await supabase
          .from('categories')
          .select('id')
          .in('slug', selectedCategories);
        
        if (categoryIds && categoryIds.length > 0) {
          const { data: newsIds } = await supabase
            .from('news_categories')
            .select('news_id')
            .in('category_id', categoryIds.map(cat => cat.id));
          
          if (newsIds && newsIds.length > 0) {
            query = query.in('id', newsIds.map(item => item.news_id));
          } else {
            // No news with selected categories, return empty array
            return [];
          }
        } else {
          // No matching categories, return empty array
          return [];
        }
      }
      
      // Add search filtering if needed
      if (searchQuery?.trim()) {
        const searchTerm = `%${searchQuery.toLowerCase()}%`;
        query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log("Fetched paginated news articles:", data);

      return data || [];
    },
  });

  // When searching, query all news to allow searching outside current page
  const { data: allNewsForSearch, isLoading: allNewsSearchLoading } = useQuery({
    queryKey: ['all-news-search', searchQuery],
    queryFn: async () => {
      // Only fetch all news when there's a search query
      if (!searchQuery?.trim()) return null;
      
      console.log('Fetching all news for search: ', searchQuery);
      const { data, error } = await supabase
        .from('news')
        .select('id, title, content, created_at, slug, featured_image')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery?.trim(),
  });

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
    currentPage,
    totalPages,
    handlePageChange
  };
}
