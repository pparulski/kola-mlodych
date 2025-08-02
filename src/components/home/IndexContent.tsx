
import React from "react";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";
import { LoadingIndicator } from "./LoadingIndicator";
import { ImagePreloader } from "@/components/common/ImagePreloader";
import { useOptimizedNewsData } from "@/hooks/useOptimizedNewsData";

interface IndexContentProps {
  searchQuery: string;
  selectedCategories: string[];
}

export function IndexContent({ searchQuery, selectedCategories }: IndexContentProps) {
  const {
    currentPageItems,
    isLoading,
    currentPage,
    totalPages,
    handlePageChange,
    totalItems,
    error
  } = useOptimizedNewsData(searchQuery, selectedCategories);
  
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

  // Get the first TWO articles' featured images for preloading
  const firstArticleImage = currentPageItems?.[0]?.featured_image;
  const secondArticleImage = currentPageItems?.[1]?.featured_image;
  const shouldPreload = !hasFilterOrSearch && currentPageItems && currentPageItems.length > 0;

  return (
    <div>
      {/* Preload the first TWO articles' images for better LCP */}
      {shouldPreload && firstArticleImage && (
        <ImagePreloader
          imageUrl={firstArticleImage}
          priority={true}
        />
      )}
      {shouldPreload && secondArticleImage && (
        <ImagePreloader
          imageUrl={secondArticleImage}
          priority={true}
        />
      )}
      
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
