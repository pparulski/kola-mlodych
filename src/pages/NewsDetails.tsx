
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsContent } from "@/components/news/NewsContent";
import { NewsArticle } from "@/types/news";

export function NewsDetails() {
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
      return data as NewsArticle;
    },
    enabled: !!id, // Only run the query if we have an ID
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
    <div className="max-w-4xl mx-auto mt-8">
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
  );
}
