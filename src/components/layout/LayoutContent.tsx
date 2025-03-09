
import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { PageHeader } from "./PageHeader";
import { SelectedCategories } from "./SelectedCategories";
import { getPageTitle } from "@/utils/pageUtils";
import { Category } from "@/types/categories";
import { Menu } from "lucide-react";

export function LayoutContent() {
  // State and hooks
  const { isOpen, setIsOpen } = useSidebar();
  const location = useLocation();
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Path-related variables
  const isCategoryPage = location.pathname.startsWith('/category/');
  const isManagementPage = location.pathname.includes('/manage/');
  const categorySlug = isCategoryPage ? params.slug : null;
  const isHomePage = location.pathname === '/';

  // Fetch categories for home page
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
  
  // Fetch category name for category pages
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

  // Fetch static page title
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

  // Reset search state on navigation
  useEffect(() => {
    setSearchQuery("");
    setSelectedCategories([]);
  }, [location.pathname]);

  // Update URL with search params for home page
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

  // Initialize search from URL params
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

  // Determine page title
  let pageTitle: string | null = null;
  
  if (isManagementPage) {
    pageTitle = null; // Management pages handle their own titles
  } else if (isCategoryPage && categoryData) {
    pageTitle = `Artykuły w kategorii: ${categoryData.name}`;
  } else {
    pageTitle = getPageTitle(location.pathname, staticPage?.title);
  }

  // Event handlers
  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full">
        {/* Join banner */}
        <Link 
          to="/dolacz-do-nas"
          className="bg-primary p-4 text-primary-foreground text-center font-bold shadow-lg sticky top-0 z-10 hover:bg-accent transition-colors"
        >
          <span>Dołącz do nas!</span>
        </Link>

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6">
          {/* Header section with sidebar toggle and page header in one row */}
          {!isManagementPage && (
            <div className="flex items-start mb-4">
              {/* Mobile sidebar toggle */}
              <div className="md:hidden mr-3">
                <button 
                  className="flex items-center justify-center h-10 w-10"
                  onClick={toggleSidebar}
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
              
              {/* Page header */}
              <div className="flex-1">
                <PageHeader 
                  pageTitle={pageTitle}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  categories={categories}
                />
              </div>
            </div>
          )}

          {/* Selected categories (home page only) */}
          {isHomePage && (
            <div className="mt-2">
              <SelectedCategories 
                selectedCategories={selectedCategories} 
                setSelectedCategories={setSelectedCategories}
                categories={categories}
              />
            </div>
          )}

          {/* Page content */}
          <div className="max-w-4xl mx-auto mt-2">
            <Outlet context={{ searchQuery, selectedCategories }} />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
    </>
  );
}
