
import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { PageHeader } from "./PageHeader";
import { SelectedCategories } from "./SelectedCategories";
import { getPageTitle } from "@/utils/pageUtils";
import { Category } from "@/types/categories";

export function LayoutContent() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Only fetch categories on the homepage
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
    enabled: location.pathname === '/',
  });

  // Reset search and filters when location changes or page reloads
  useEffect(() => {
    setSearchQuery("");
    setSelectedCategories([]);
  }, [location.pathname]);

  // Pass search and filter values to the Index component through URL parameters
  useEffect(() => {
    if (location.pathname === '/') {
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

  // Read URL parameters when the component mounts
  useEffect(() => {
    if (location.pathname === '/') {
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

  // Determine if we're on a management page
  const isManagementPage = location.pathname.includes('zarzadzanie');

  const { data: staticPage } = useQuery({
    queryKey: ['static-page-title', location.pathname],
    queryFn: async () => {
      // Extract slug from pathname (removing leading slash)
      const slug = location.pathname.substring(1);
      const { data, error } = await supabase
        .from('static_pages')
        .select('title')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !Object.keys(getPageTitle('', '')).includes(location.pathname) && !isManagementPage
  });

  const handleOverlayClick = () => {
    setOpen(false);
  };

  const pageTitle = isManagementPage ? null : getPageTitle(location.pathname, staticPage?.title);

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full">
        <Link 
          to="/dolacz-do-nas"
          className="bg-primary p-4 text-primary-foreground text-center font-bold shadow-lg sticky top-0 z-10 hover:bg-accent transition-colors"
        >
          <span>Dołącz do nas!</span>
        </Link>
        <main className="flex-1 p-4 md:p-6">
          {!isManagementPage && (
            <PageHeader 
              pageTitle={pageTitle}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              categories={categories}
            />
          )}

          {location.pathname === '/' && (
            <SelectedCategories 
              selectedCategories={selectedCategories} 
              setSelectedCategories={setSelectedCategories}
              categories={categories}
            />
          )}

          <div className="max-w-4xl mx-auto">
            <Outlet context={{ searchQuery, selectedCategories }} />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
    </>
  );
}
