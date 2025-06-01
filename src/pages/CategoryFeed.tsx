
import { useState, useEffect } from "react";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NewsPreview } from "@/components/news/NewsPreview";
import { Category } from "@/types/categories";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo/SEO";
import { formatNewsItems, ARTICLES_PER_PAGE } from "@/hooks/news/useNewsBase";
import { useNewsPagination } from "@/hooks/news/useNewsPagination";
import { NewsPagination } from "@/components/news/NewsPagination";
import { NewsArticle } from "@/types/news";

interface CategoryArticlesResult {
  articles: any[];
  count: number;
}

export default function CategoryFeed() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
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
        .maybeSingle();
      
      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
    staleTime: 60000,
  });

  // Parse page from URL or use default
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // Set up pagination - important to do this after we have a category
  const { currentPage, totalPages, handlePageChange, getPaginationIndices } = useNewsPagination(totalArticles, ARTICLES_PER_PAGE);
  
  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
    }
  }, [category]);
  
  // Keep track of previous slug to reset pagination when category changes
  const [previousSlug, setPreviousSlug] = useState<string | undefined>(slug);
  
  useEffect(() => {
    if (slug !== previousSlug) {
      setTotalArticles(0);
      setPreviousSlug(slug);
    }
  }, [slug, previousSlug]);
  
  // Fetch articles from this category with pagination
  const { data: articlesData, isLoading: isArticlesLoading } = useQuery<CategoryArticlesResult>({
    queryKey: ["category-articles", slug, currentPage],
    queryFn: async () => {
      if (!category) return { articles: [], count: 0 };
      
      const { from, to } = getPaginationIndices();
      
      console.log(`CategoryFeed: Fetching page ${currentPage} with range ${from}-${to}`);
      
      // First get the total count
      const { count, error: countError } = await supabase
        .from("news_categories")
        .select("*", { count: 'exact', head: true })
        .eq("category_id", category.id);
        
      if (countError) throw countError;
      
      // Update total count state
      setTotalArticles(count || 0);
      
      console.log(`CategoryFeed: Found ${count} total articles for category ${category.name}`);
      
      // Then get the paginated articles
      const { data, error } = await supabase
        .from("news_categories")
        .select(`
          news_id,
          news (*)
        `)
        .eq("category_id", category.id)
        .order('news(date)', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      const articles = data
        .map(item => item.news)
        .filter(article => article);
        
      console.log(`CategoryFeed: Retrieved ${articles.length} articles for page ${currentPage}`);
      
      // Return articles and count for pagination
      return {
        articles: articles,
        count: count || 0
      };
    },
    enabled: !!category,
    staleTime: 10000,
  });
  
  // Format the articles using our consistent formatter
  const articles = articlesData?.articles ? formatNewsItems(articlesData.articles) : [];
  
  // Generate standardized description for category
  const generateCategoryDescription = (categoryName: string, articleCount: number): string => {
    const baseDescription = `Przeglądaj artykuły z kategorii ${categoryName} na stronie Kół Młodych OZZ Inicjatywy Pracowniczej.`;
    
    // Ensure exactly 160 characters
    if (baseDescription.length > 160) {
      return `${baseDescription.substring(0, 157)}...`;
    }
    
    return baseDescription;
  };

  // Extract featured image from first article for category SEO
  const getCategoryImage = (): string | undefined => {
    if (articles && articles.length > 0 && articles[0].featured_image) {
      return articles[0].featured_image;
    }
    return undefined;
  };
  
  const isLoading = isCategoryLoading || isArticlesLoading;
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto space-y-8 animate-pulse">
        <Skeleton className="h-12 w-2/3 max-w-md" />
        <Skeleton className="h-6 w-full max-w-lg" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {Array.from({ length: ARTICLES_PER_PAGE / 2 }).map((_, i) => (
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
        description={generateCategoryDescription(category.name, totalArticles)}
        keywords={category.name}
        image={getCategoryImage()}
      />
      
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Kategoria: {category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {totalArticles > 0 
                ? `Znaleziono ${totalArticles} ${
                    totalArticles === 1 ? 'artykuł' : 
                    totalArticles < 5 ? 'artykuły' : 'artykułów'
                  }` 
                : "Brak artykułów w tej kategorii"}
            </p>
          </div>
        </div>
      </div>
      
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
          
          <NewsPagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            handlePageChange={handlePageChange} 
          />
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
