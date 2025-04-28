
import { Outlet } from "react-router-dom";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useCategories } from "@/hooks/useCategories";
import { PageHeader } from "./PageHeader";
import { CategorySection } from "./CategorySection";

export function PageLayout() {
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, isHomePage } = useSearchParams();
  const { data: categories } = useCategories();

  return (
    <div className="flex-1 p-4 md:p-6 relative">
      <div className="w-full">
        <PageHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          categories={categories}
          key="page-header" // Force stable identity
        />
      </div>

      <CategorySection 
        isHomePage={isHomePage}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={categories}
      />

      <div className="max-w-4xl mx-auto mt-2">
        <Outlet context={{ searchQuery, selectedCategories }} />
      </div>
    </div>
  );
}
