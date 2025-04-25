
import React, { useEffect } from "react";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";
import { LoadingIndicator } from "./LoadingIndicator";
import { useOptimizedNewsData } from "@/hooks/useOptimizedNewsData";
import { useCategories } from "@/hooks/useCategories";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface IndexContentProps {
  searchQuery: string;
  selectedCategories: string[];
}

export function IndexContent({ searchQuery, selectedCategories }: IndexContentProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
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
  
  // Debug effect to log when categories change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      console.log("IndexContent: Selected categories changed:", selectedCategories);
      
      // Show toast with selected categories for testing
      toast({
        title: "Filtrowanie kategorii",
        description: `Wybrane kategorie: ${selectedCategories.join(", ")}`,
        duration: 3000,
      });
    }
  }, [selectedCategories, toast]);
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['optimized-news'] });
  };
  
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
      {selectedCategories.length > 0 && currentPageItems.length === 0 && (
        <div className="text-center p-6 bg-muted/30 rounded-lg mb-6">
          <p className="font-medium">Brak artykułów w wybranych kategoriach.</p>
          <button 
            className="text-primary hover:text-primary/80 underline text-sm mt-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['optimized-news'] })}
          >
            Odśwież wyniki
          </button>
        </div>
      )}

      <NewsList 
        newsItems={currentPageItems || []} 
        onRefresh={handleRefresh} 
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
