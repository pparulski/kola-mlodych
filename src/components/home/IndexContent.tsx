
import React, { useEffect } from "react";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";
import { LoadingIndicator } from "./LoadingIndicator";
import { useOptimizedNewsData } from "@/hooks/useOptimizedNewsData";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";

interface IndexContentProps {
  searchQuery: string;
  selectedCategories: string[];
}

export function IndexContent({ searchQuery, selectedCategories }: IndexContentProps) {
  const { toast } = useToast();
  const { data: categories } = useCategories();
  
  const {
    currentPageItems,
    isLoading,
    currentPage,
    totalPages,
    handlePageChange,
    error
  } = useOptimizedNewsData(searchQuery, selectedCategories);

  // Show toast for category filter changes
  useEffect(() => {
    if (selectedCategories.length > 0 && categories) {
      const categoryNames = selectedCategories.map(slug => {
        const category = categories.find(cat => cat.slug === slug);
        return category ? category.name : slug;
      });
      
      toast({
        title: "Filtrowanie kategorii",
        description: `Wybrane kategorie: ${categoryNames.join(", ")}`,
        duration: 3000,
      });
    }
  }, [selectedCategories, categories, toast]);
  
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    console.error('Error loading news:', error);
    return (
      <div className="text-center p-8 bg-card rounded-lg border-2 border-destructive">
        <p className="text-lg font-medium mb-2">Wystąpił błąd podczas wczytywania artykułów.</p>
        <p className="text-muted-foreground mb-4">Proszę odświeżyć stronę lub spróbować ponownie później.</p>
      </div>
    );
  }

  return (
    <div>
      {selectedCategories.length > 0 && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Filtrowanie według kategorii</h3>
              <p className="text-sm text-muted-foreground">
                {currentPageItems.length > 0 
                  ? `Znaleziono ${currentPageItems.length} artykułów` 
                  : "Brak artykułów w wybranych kategoriach"}
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
