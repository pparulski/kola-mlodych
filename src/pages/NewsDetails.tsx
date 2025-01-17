import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsContent } from "@/components/news/NewsContent";

export function NewsDetails() {
  const { id } = useParams();

  const { data: news, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      console.log('Fetching news article with id:', id);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!news) {
    return <div>Article not found</div>;
  }

  return <NewsContent news={news} />;
}