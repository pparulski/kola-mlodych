
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsPreview } from "@/components/news/NewsPreview";
import { Category } from "@/types/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo/SEO";
import { formatNewsItems, ARTICLES_PER_PAGE } from "@/hooks/news/useNewsBase";
import { useNewsPagination } from "@/hooks/news/useNewsPagination";
import { NewsPagination } from "@/components/news/NewsPagination";

export default function CategoryFeed() {
  const { slug } = useParams<{ slug: string }>();
  const [categoryName, setCategoryName] = useState("");
  const [totalArticles, setTotalArticles] = useState(0);
  
  // Fetch the category details
  const { data: category, isLoading: isCategoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Set up pagination
  const { currentPage, totalPages, handlePageChange } = useNewsPagination(totalArticles, ARTICLES_PER_PAGE);
  
  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      // Update document title when category is loaded
      document.title = `${category.name} - Młodzi IP`;
    }
  }, [category]);
  
  // Fetch articles from this category with pagination
  const { data: articlesRaw, isLoading: isArticlesLoading } = useQuery({
    queryKey: ["category-articles", slug, currentPage],
    queryFn: async () => {
      if (!category) return { articles: [], count: 0 };
      
      // First get the total count
      const { count, error: countError } = await supabase
        .from("news_categories")
        .select("*", { count: 'exact', head: true })
        .eq("category_id", category.id);
        
      if (countError) throw countError;
      
      // Update total count state
      setTotalArticles(count || 0);
      
      // Then get the paginated articles
      const { data, error } = await supabase
        .from("news_categories")
        .select(`
          news_id,
          news (*)
        `)
        .eq("category_id", category.id)
        .order('news(created_at)', { ascending: false })
        .range((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE - 1);
      
      if (error) throw error;
      
      // Return only the news articles
      return {
        articles: data
          .map(item => item.news)
          .filter(article => article),
        count: count || 0
      };
    },
    enabled: !!category,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  
  // Format the articles using our consistent formatter
  const articles = articlesRaw?.articles ? formatNewsItems(articlesRaw.articles) : [];
  
  const isLoading = isCategoryLoading || isArticlesLoading;
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto space-y-8 animate-pulse">
        <Skeleton className="h-12 w-2/3 max-w-md" />
        <Skeleton className="h-6 w-full max-w-lg" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="container max-w-4xl mx-auto animate-fade-in">
        <SEO
          title="Kategoria nie znaleziona"
          description="Przepraszamy, ale nie mogliśmy znaleźć kategorii o podanym adresie."
        />
        <p className="content-box text-muted-foreground p-5">
          Przepraszamy, ale nie mogliśmy znaleźć kategorii o podanym adresie.
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <SEO 
        title={category.name}
        description={`Przeglądaj artykuły z kategorii ${category.name} na stronie Kół Młodych OZZ Inicjatywy Pracowniczej.`}
        keywords={category.name}
      />
      
      {articles && articles.length > 0 ? (
        <>
          <div className="space-y-6 !mt-0">
            {articles.map((article) => (
              <NewsPreview 
                key={article.id}
                id={article.id}
                slug={article.slug}
                title={article.title}
                preview_content={article.preview_content}
                date={article.date || undefined}
                featured_image={article.featured_image || undefined}
                category_names={[category.name]}
              />
            ))}
          </div>
          
          {/* Add pagination */}
          {totalPages > 1 && (
            <NewsPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              handlePageChange={handlePageChange} 
            />
          )}
        </>
      ) : (
        <div className="text-center py-10 content-box !mt-0">
          <h2 className="text-xl font-medium">Brak artykułów</h2>
          <p className="text-muted-foreground mt-2">
            W tej kategorii nie ma jeszcze żadnych artykułów.
          </p>
        </div>
      )}
    </div>
  );
}
