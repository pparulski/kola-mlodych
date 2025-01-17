import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsContent } from "@/components/news/NewsContent";

const NewsArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl">Loading...</h1>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-red-500">Artykuł nie został znaleziony</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <Button 
        variant="outline" 
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Wróć
      </Button>
      
      <Card>
        <CardContent className="pt-6">
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