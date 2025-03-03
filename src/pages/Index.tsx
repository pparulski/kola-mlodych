
import { useOutletContext } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useNewsData } from "@/hooks/useNewsData";
import { NewsList } from "@/components/news/NewsList";
import { NewsPagination } from "@/components/news/NewsPagination";

interface IndexContext {
  searchQuery: string;
  selectedCategories: string[];
}

export default function Index() {
  const { searchQuery, selectedCategories } = useOutletContext<IndexContext>();
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
    return <div>Wczytywanie...</div>;
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
