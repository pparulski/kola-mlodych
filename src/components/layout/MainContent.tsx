
import { Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { CategorySection } from "./CategorySection";
import { PageHeader } from "./PageHeader";
import { useSearchParams } from "@/hooks/useSearchParams";

export function MainContent() {
  const location = useLocation();
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, isHomePage } = useSearchParams();
  const isManagementPage = location.pathname.includes('/manage/');
  const isCategoryPage = location.pathname.startsWith('/category/');

  const { data: categories } = useQuery({
    queryKey: ['layout-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
    enabled: isHomePage,
  });

  return (
    <main className="flex-1 p-4 md:p-6 relative">
      <div className="w-full">
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

      <div className="max-w-4xl mx-auto mt-2">
        <Outlet context={{ searchQuery, selectedCategories }} />
      </div>
    </main>
  );
}
