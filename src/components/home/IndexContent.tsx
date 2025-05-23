
import React from "react";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";
import { LoadingIndicator } from "./LoadingIndicator";
import { useOptimizedNewsData } from "@/hooks/useOptimizedNewsData";

interface IndexContentProps {
  searchQuery: string;
  selectedCategories: string[];
  currentPage: number;
  handlePageChange: (newPage: number) => void;
  updateTotalItems: (count: number) => void;
}

export function IndexContent({
  searchQuery,
  selectedCategories,
  currentPage,
  handlePageChange,
  updateTotalItems
}: IndexContentProps) {
  const {
    currentPageItems,
    isLoading,
    totalPages,
    totalItems,
    error
  } = useOptimizedNewsData({
    searchQuery,
    selectedCategories,
    currentPage,
    handlePageChange,
    updateTotalItems
  });
  
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border-2 border-destructive">
        <p className="text-lg font-medium mb-2">Wystąpił błąd podczas wczytywania artykułów.</p>
        <p className="text-muted-foreground mb-4">Proszę odświeżyć stronę lub spróbować ponownie później.</p>
        <pre className="text-xs bg-muted p-2 rounded overflow-auto">{String(error)}</pre>
      </div>
    );
  }

  const hasFilterOrSearch = selectedCategories.length > 0 || searchQuery;
  const filterType = searchQuery ? "wyszukiwania" : "kategorii";
  const filterTitle = searchQuery ? `"${searchQuery}"` : "";

  return (
    <div>
      {hasFilterOrSearch && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                {searchQuery ? 'Wyniki wyszukiwania' : 'Filtrowanie według kategorii'}
                {searchQuery ? ` "${searchQuery}"` : ''}
              </h3>
              <p className="text-sm text-muted-foreground">
                {totalItems > 0 
                  ? `Znaleziono ${totalItems} ${
                      totalItems === 1 ? 'artykuł' : 
                      totalItems < 5 ? 'artykuły' : 'artykułów'
                    } dla ${filterType} ${filterTitle}` 
                  : `Brak artykułów dla ${filterType} ${filterTitle}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <NewsList 
        newsItems={currentPageItems || []} 
      />
      
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
