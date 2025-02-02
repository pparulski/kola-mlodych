import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
      
      // Changed to use proper Supabase query construction
      const { data, error } = await supabase
        .from('news')
        .select()
        .match({ id })
        .maybeSingle();

      if (error) {
        console.error('Error fetching article:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Article not found');
      }
      
      return data;
    },
    enabled: Boolean(id), // Only run query if we have an ID
    retry: false, // Don't retry on error
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
          {error instanceof Error 
            ? error.message 
            : "Artykuł nie został znaleziony"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="h-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć
        </Button>
      </div>
      
      <Card className="mt-4">
        <CardContent className="p-4 md:p-6">
          <NewsContent
            title={article.title}
            content={article.content}
            date={article.created_at}
            featured_image={article.featured_image}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsArticle;