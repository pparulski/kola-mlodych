
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsPreview } from "@/components/news/NewsPreview";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useOutletContext, useLocation } from "react-router-dom";

const ARTICLES_PER_PAGE = 8;

interface IndexContext {
  searchQuery: string;
  selectedCategories: string[];
}

export default function Index() {
  const location = useLocation();
  const { searchQuery, selectedCategories } = useOutletContext<IndexContext>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Reset page when search or categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories]);
  
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

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

  const isLoading = categoriesLoading || newsLoading || (searchQuery?.trim() && allNewsSearchLoading);
  
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

  if (isLoading) {
    return <div>Wczytywanie...</div>;
  }

  return (
    <div>
      <div className="space-y-6">
        {(!currentPageItems || currentPageItems.length === 0) ? (
          <div className="text-center p-8 bg-card rounded-lg border-2 border-border">
            <p>Nie znaleziono artykułów spełniających kryteria.</p>
          </div>
        ) : (
          currentPageItems.map((article) => (
            <NewsPreview
              key={article.id}
              id={article.id}
              slug={article.slug}
              title={article.title}
              content={article.content}
              date={article.created_at}
              featured_image={article.featured_image}
            />
          ))
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Poprzednia</span>
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center"
          >
            <span className="hidden sm:inline">Następna</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
