
import React from "react";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";
import { LoadingIndicator } from "./LoadingIndicator";
import { useNewsData } from "@/hooks/useNewsData";
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
    handlePageChange
  } = useNewsData(searchQuery, selectedCategories);

  const isLoading = categoriesLoading || newsLoading;
  
  if (isLoading) {
    return <LoadingIndicator type="skeleton" />;
  }

  return (
    <div>
      <NewsList newsItems={currentPageItems} />
      <NewsPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        handlePageChange={handlePageChange}
      />
    </div>
  );
}
