import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsContent } from "@/components/news/NewsContent";
import { StaticPage } from "@/components/StaticPage";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NewsDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // If we're on a static page route, render the StaticPage component
  if (slug) {
    return <StaticPage />;
  }

  const { id } = useParams();
  console.log("Fetching news article with ID:", id);

  const { data: news, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) throw new Error('News ID is required');
      
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div>Loading...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div>Article not found</div>
      </div>
    );
  }

  return (
    <>
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="h-10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Wróć
      </Button>
      <div className="max-w-4xl mx-auto mt-6">
        <Card>
          <CardContent className="pt-6">
            <NewsContent
              title={news.title}
              content={news.content}
              date={news.created_at}
              featured_image={news.featured_image}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}