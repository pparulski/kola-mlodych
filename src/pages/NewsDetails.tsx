
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isValid } from "date-fns";
import { pl } from "date-fns/locale";

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['news', slug],
    queryFn: async () => {
      if (!slug) throw new Error('News slug is required');
      console.log('Fetching news article with slug:', slug);
      
      const { data, error } = await supabase
        .from('news')
        .select()
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching article:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Article not found');
      }
      
      return data;
    },
    enabled: Boolean(slug),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="h-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć
        </Button>
        <div className="mt-4">Ładowanie...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="h-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Wróć
        </Button>
        <div className="mt-4">
          {error instanceof Error 
            ? error.message 
            : "Artykuł nie został znaleziony"}
        </div>
      </div>
    );
  }

  const formattedDate = article.created_at 
    ? (() => {
        const parsedDate = new Date(article.created_at);
        return isValid(parsedDate) 
          ? format(parsedDate, "d MMMM yyyy", { locale: pl })
          : "";
      })()
    : "";

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="h-8"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Wróć
      </Button>
      
      <article className="space-y-6 p-4 md:p-6 bg-card rounded-lg border-2 border-border overflow-hidden">
        {article.featured_image && (
          <img
            src={article.featured_image}
            alt=""
            className="w-full h-48 md:h-64 object-cover rounded-md"
          />
        )}
        <div className="space-y-4 md:space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-primary break-words">
              {article.title}
            </h2>
            {formattedDate && (
              <p className="text-sm text-foreground">{formattedDate}</p>
            )}
          </div>
          <div 
            className="prose prose-sm md:prose-base max-w-none dark:prose-invert break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default NewsArticle;
