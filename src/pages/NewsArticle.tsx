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
      <div className="space-y-4">
        <h1 className="text-2xl text-[rgb(128_0_32_/_var(--tw-text-opacity))]">Ładowanie...</h1>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl text-[rgb(128_0_32_/_var(--tw-text-opacity))]">Artykuł nie został znaleziony</h1>
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