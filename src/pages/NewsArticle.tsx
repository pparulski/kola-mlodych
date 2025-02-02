import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsContent } from "@/components/news/NewsContent";

const NewsArticle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) throw new Error('News ID is required');
      console.log('Fetching news article with ID:', id);
      
      const { data, error } = await supabase
        .from('news')
        .select()
        .match({ id, is_static_page: false })
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        throw error;
      }
      
      return data;
    },
    enabled: Boolean(id),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="h-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć
        </Button>
        <div className="mt-4">Ładowanie...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="h-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć
        </Button>
        <div className="mt-4">
          Artykuł nie został znaleziony
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="h-8"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Wróć
      </Button>
      
      <NewsContent
        title={article.title}
        content={article.content}
        date={article.created_at}
        featured_image={article.featured_image}
      />
    </div>
  );
};

export default NewsArticle;