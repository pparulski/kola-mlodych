import { useState, useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { getPageTitle } from "@/utils/pageUtils";
import { Category } from "@/types/categories";
import { CategorySection } from "./CategorySection";
import { SidebarOverlay } from "./SidebarOverlay";
import { JoinBanner } from "./JoinBanner";
import { PageHeader } from "./PageHeader";

export function LayoutContent() {
  const { isOpen, setIsOpen } = useSidebar();
  const location = useLocation();
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const isCategoryPage = location.pathname.startsWith('/category/');
  const isManagementPage = location.pathname.includes('/manage/');
  const categorySlug = isCategoryPage ? params.slug : null;
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

  const { data: categoryData } = useQuery({
    queryKey: ['category-title', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', categorySlug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!categorySlug,
  });

  const { data: staticPage } = useQuery({
    queryKey: ['static-page-title', location.pathname],
    queryFn: async () => {
      const slug = location.pathname.substring(1);
      const { data, error } = await supabase
        .from('static_pages')
        .select('title')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !Object.keys(getPageTitle('', '')).includes(location.pathname) && !isManagementPage && !isCategoryPage
  });

  useEffect(() => {
    setSearchQuery("");
    setSelectedCategories([]);
  }, [location.pathname]);

  useEffect(() => {
    if (isHomePage) {
      const params = new URLSearchParams(location.search);
      
      if (searchQuery) {
        params.set('search', searchQuery);
      } else {
        params.delete('search');
      }
      
      if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
      } else {
        params.delete('categories');
      }
      
      const newSearch = params.toString();
      const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
      
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchQuery, selectedCategories, location.pathname]);

  useEffect(() => {
    if (isHomePage) {
      const params = new URLSearchParams(location.search);
      
      const searchParam = params.get('search');
      if (searchParam) {
        setSearchQuery(searchParam);
      }
      
      const categoriesParam = params.get('categories');
      if (categoriesParam) {
        setSelectedCategories(categoriesParam.split(','));
      }
    }
  }, [location.pathname, location.search]);

  let pageTitle: string | null = null;
  
  if (isManagementPage) {
    pageTitle = null;
  } else if (isCategoryPage && categoryData) {
    pageTitle = `Artykuły w kategorii: ${categoryData.name}`;
  } else {
    pageTitle = getPageTitle(location.pathname, staticPage?.title);
  }

  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full">
        <JoinBanner />

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
      </div>

      <SidebarOverlay isOpen={isOpen} handleOverlayClick={handleOverlayClick} />
    </>
  );
}
