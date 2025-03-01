
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

  // Query for filtered news based on categories
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news', selectedCategories],
    queryFn: async () => {
      console.log('Fetching news articles with categories:', selectedCategories);
      
      let query = supabase
        .from('news')
        .select(`
          *,
          news_categories!inner (
            category_id,
            categories(slug)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (selectedCategories.length > 0) {
        query = query.in('news_categories.categories.slug', selectedCategories);
      }

      const { data, error } = await query;

      if (error) throw error;
      console.log("Fetched news articles:", data);

      const uniqueNews = Array.from(new Map(data.map(item => [item.id, item])).values());
      return uniqueNews;
    },
    enabled: !categoriesLoading && selectedCategories.length > 0,
  });

  // Query for all news when no categories are selected
  const { data: allNews, isLoading: allNewsLoading } = useQuery({
    queryKey: ['all-news'],
    queryFn: async () => {
      console.log('Fetching all news articles');
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched all news articles:", data);
      return data;
    },
    enabled: selectedCategories.length === 0,
  });

  const isLoading = categoriesLoading || (selectedCategories.length > 0 ? newsLoading : allNewsLoading);
  const displayedNews = selectedCategories.length > 0 ? news : allNews;

  // Search through all news regardless of category filtering or pagination
  const filteredNews = displayedNews?.filter(article => {
    if (!searchQuery?.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query)
    );
  });

  const totalArticles = filteredNews?.length || 0;
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const paginatedNews = filteredNews?.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

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
        {paginatedNews?.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-lg border-2 border-border">
            <p>Nie znaleziono artykułów spełniających kryteria.</p>
          </div>
        ) : (
          paginatedNews?.map((article) => (
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
