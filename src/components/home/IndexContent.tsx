
import React, { useEffect } from "react";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";
import { LoadingIndicator } from "./LoadingIndicator";
import { useNewsData } from "@/hooks/useNewsData";
import { useCategories } from "@/hooks/useCategories";
import { Alert, AlertCircle } from "lucide-react";

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
      <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
          <h3 className="font-medium">Wystąpił błąd podczas ładowania danych</h3>
        </div>
        <p className="mt-2 text-sm">
          {newsError ? `Błąd ładowania aktualności: ${newsError.message}` : ''}
          {categoriesError ? `Błąd ładowania kategorii: ${categoriesError.message}` : ''}
        </p>
        <p className="mt-2 text-sm">Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.</p>
      </div>
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
