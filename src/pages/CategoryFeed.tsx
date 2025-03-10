
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsPreview } from "@/components/news/NewsPreview";
import { Category } from "@/types/categories";
import { NewsArticle } from "@/types/news";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryFeed() {
  const { slug } = useParams<{ slug: string }>();
  const [categoryName, setCategoryName] = useState("");
  
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
    staleTime: 0, // Ensure we always get fresh data
  });
  
  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      document.title = `${category.name} - Młodzi IP`;
    }
  }, [category]);
  
  // Fetch articles from this category
  const { data: articles, isLoading: isArticlesLoading } = useQuery({
    queryKey: ["category-articles", slug],
    queryFn: async () => {
      if (!category) return [];
      
      const { data, error } = await supabase
        .from("news_categories")
        .select(`
          news_id,
          news (*)
        `)
        .eq("category_id", category.id);
      
      if (error) throw error;
      
      // Return only the news articles, sorted by date descending
      return data
        .map(item => item.news)
        .filter(article => article) // Remove any null items
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        }) as NewsArticle[];
    },
    enabled: !!category,
    staleTime: 0, // Ensure we always get fresh data
  });
  
  const isLoading = isCategoryLoading || isArticlesLoading;
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-8">
        <Skeleton className="h-12 w-2/3 max-w-md" />
        <Skeleton className="h-6 w-full max-w-lg" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Kategoria nie znaleziona</h1>
        <p className="text-muted-foreground mt-4 bg-[hsl(var(--content-box))] p-6 rounded-lg">
          Przepraszamy, ale nie mogliśmy znaleźć kategorii o podanym adresie.
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {articles && articles.length > 0 ? (
        <div className="space-y-6">
          {articles.map((article) => (
            <NewsPreview 
              key={article.id}
              id={article.id}
              slug={article.slug}
              title={article.title}
              content={article.content}
              date={article.date || undefined}
              featured_image={article.featured_image || undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-[hsl(var(--content-box))] rounded-lg">
          <h2 className="text-xl font-medium">Brak artykułów</h2>
          <p className="text-muted-foreground mt-2">
            W tej kategorii nie ma jeszcze żadnych artykułów.
          </p>
        </div>
      )}
    </div>
  );
}
