
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsPreview } from "@/components/news/NewsPreview";

export default function Index() {
  const { data: news, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      console.log('Fetching all news articles');
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched news articles:", data);
      return data;
    },
  });

  if (isLoading) {
    return <div>Wczytywanie...</div>;
  }

  return (
    <div className="space-y-6">
      {news?.map((article) => (
        <NewsPreview
          key={article.id}
          id={article.id}
          slug={article.slug}
          title={article.title}
          content={article.content}
          date={article.created_at}
          featured_image={article.featured_image}
        />
      ))}
    </div>
  );
}
