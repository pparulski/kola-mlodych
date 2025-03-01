
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { useState, useEffect } from "react";
import { Category } from "@/types/categories";

function getPageTitle(pathname: string, staticPageTitle?: string): string {
  // Default titles for known routes
  const titles: { [key: string]: string } = {
    '/': 'Aktualności',
    '/kola-mlodych': 'Lista Kół Młodych',
    '/downloads': 'Pliki do pobrania',
    '/ebooks': 'Publikacje',
    '/auth': 'Logowanie',
  };

  // If we have a static page title from the database, use that
  if (staticPageTitle) {
    return staticPageTitle;
  }

  return titles[pathname] || 'Aktualności';
}

function LayoutContent() {
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

  const { data: staticPage } = useQuery({
    queryKey: ['static-page-title', location.pathname],
    queryFn: async () => {
      // Remove leading slash for the slug
      const slug = location.pathname.substring(1);
      const { data, error } = await supabase
        .from('static_pages')
        .select('title')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !Object.keys(getPageTitle('', '')).includes(location.pathname)
  });

  const handleOverlayClick = () => {
    setOpen(false);
  };

  const pageTitle = getPageTitle(location.pathname, staticPage?.title);

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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 md:gap-4 self-start">
              <SidebarTrigger className="md:hidden h-8 w-8" onClick={() => setOpen(!open)}>
                <Menu className="h-8 w-8" />
              </SidebarTrigger>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                {pageTitle}
              </h1>
            </div>
            
            {location.pathname === '/' && (
              <>
                {categories && categories.length > 0 && (
                  <div className="ml-auto">
                    <CategoryFilter
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      availableCategories={categories}
                      position="top"
                    />
                  </div>
                )}
                
                <div className="relative w-full mt-4 md:mt-0 md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Szukaj..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </>
            )}
          </div>
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

export function Layout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full">
        <LayoutContent />
      </div>
    </SidebarProvider>
  );
}
