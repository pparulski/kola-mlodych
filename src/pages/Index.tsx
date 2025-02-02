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
        .eq('is_static_page', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {news?.map((article) => (
        <NewsPreview
          key={article.id}
          id={article.id}
          title={article.title}
          content={article.content}
          date={article.created_at}
          featured_image={article.featured_image}
          slug={article.slug}
        />
      ))}
    </div>
  );
}