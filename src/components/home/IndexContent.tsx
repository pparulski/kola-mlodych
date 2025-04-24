import React, { useEffect } from "react";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";
import { LoadingIndicator } from "./LoadingIndicator";
import { useNewsData } from "@/hooks/useNewsData";
import { useCategories } from "@/hooks/useCategories";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface IndexContentProps {
  searchQuery: string;
  selectedCategories: string[];
}

export function IndexContent({ searchQuery, selectedCategories }: IndexContentProps) {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  const {
    currentPageItems,
    isLoading: newsLoading,
    error: newsError,
    currentPage,
    totalPages,
    handlePageChange
  } = useNewsData(searchQuery, selectedCategories);

  const isLoading = categoriesLoading || newsLoading;
  
  useEffect(() => {
    console.log("IndexContent rendering, loading:", isLoading);
    console.log("News data:", currentPageItems);
    console.log("Categories data:", categories);
    if (newsError) console.error("News error:", newsError);
    if (categoriesError) console.error("Categories error:", categoriesError);
  }, [isLoading, currentPageItems, categories, newsError, categoriesError]);
  
  if (isLoading) {
    return <LoadingIndicator type="skeleton" />;
  }

  if (newsError || categoriesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Wystąpił błąd podczas ładowania danych</AlertTitle>
        <AlertDescription>
          {newsError ? `Błąd ładowania aktualności: ${newsError.message}` : ''}
          {categoriesError ? `Błąd ładowania kategorii: ${categoriesError.message}` : ''}
          <p className="mt-2">Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <NewsList newsItems={currentPageItems || []} />
      <NewsPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        handlePageChange={handlePageChange}
      />
    </div>
  );
}
