
import { useParams, useLocation, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { PageHeader } from "./PageHeader";
import { CategorySection } from "./CategorySection";

interface MainContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  pageTitle: string | null;
}

export function MainContent({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  pageTitle
}: MainContentProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
          pageTitle={pageTitle}
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
