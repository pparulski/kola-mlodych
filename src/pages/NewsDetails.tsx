import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsContent } from "@/components/news/NewsContent";

export function NewsDetails() {
  const { id } = useParams();

  const { data: news, isLoading } = useQuery({
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