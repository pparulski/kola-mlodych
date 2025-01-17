import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        {article.featured_image && (
          <div className="relative w-full h-[300px] overflow-hidden">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{article.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(article.created_at).toLocaleDateString("pl-PL")}
          </p>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsArticle;