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
      <>
        <h1 className="text-3xl font-bold text-primary">Ładowanie...</h1>
      </>
    );
  }

  if (!article) {
    return (
      <>
        <h1 className="text-3xl font-bold text-primary">Artykuł nie został znaleziony</h1>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-primary">{article.title}</h1>
      <div className="mt-6">
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć
        </Button>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <NewsContent
              content={article.content}
              date={article.created_at}
              featured_image={article.featured_image}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default NewsArticle;