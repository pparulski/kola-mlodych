
import React from "react";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";
import { LoadingIndicator } from "./LoadingIndicator";
import { useOptimizedNewsData } from "@/hooks/useOptimizedNewsData";
import { useCategories } from "@/hooks/useCategories";

interface IndexContentProps {
  searchQuery: string;
  selectedCategories: string[];
}

export function IndexContent({ searchQuery, selectedCategories }: IndexContentProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  const {
    currentPageItems,
    isLoading: newsLoading,
    currentPage,
    totalPages,
    handlePageChange,
    error
  } = useOptimizedNewsData(searchQuery, selectedCategories);

  const isLoading = categoriesLoading || newsLoading;
  
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    console.error('Error loading news:', error);
    return (
      <div className="text-center p-8 bg-card rounded-lg border-2 border-destructive">
        <p className="text-lg font-medium mb-2">Wystąpił błąd podczas wczytywania artykułów.</p>
        <p className="text-muted-foreground">Proszę odświeżyć stronę lub spróbować ponownie później.</p>
      </div>
    );
  }

  console.log(`Rendering ${currentPageItems?.length || 0} news items`);
  
  return (
    <div>
      <NewsList newsItems={currentPageItems || []} />
      {totalPages > 0 && (
        <NewsPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
}
