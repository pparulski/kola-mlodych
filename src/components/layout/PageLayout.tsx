
import { Outlet } from "react-router-dom";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useCategories } from "@/hooks/useCategories";
import { PageHeader } from "./PageHeader";
import { CategorySection } from "./CategorySection";

export function PageLayout() {
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, isHomePage } = useSearchParams();
  const { data: categories } = useCategories();

  return (
    <div className="flex-1 p-3 md:p-4 relative">
      <div className="page-container">
        <header className="page-header">
          <PageHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            categories={categories}
          />
        </header>

        <CategorySection 
          isHomePage={isHomePage}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          categories={categories}
        />

        <main className="section-spacing">
          <Outlet context={{ searchQuery, selectedCategories }} />
        </main>
      </div>
    </div>
  );
}
