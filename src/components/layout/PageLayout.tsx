
import { Outlet } from "react-router-dom";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useCategories } from "@/hooks/useCategories";
import { PageHeader } from "./PageHeader";
import { CategorySection } from "./CategorySection";

export function PageLayout() {
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, isHomePage } = useSearchParams();
  const { data: categories } = useCategories();

  return (
    <div className="flex-1 p-3 md:p-5 relative animate-fade-in">
      <div className="w-full shadow-subtle rounded-lg">
        <PageHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          categories={categories}
        />
      </div>

      <CategorySection 
        isHomePage={isHomePage}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={categories}
      />

      <div className="max-w-4xl mx-auto">
        <Outlet context={{ searchQuery, selectedCategories }} />
      </div>
    </div>
  );
}
