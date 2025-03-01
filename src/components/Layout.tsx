
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { useState, useEffect, useRef } from "react";
import { Category } from "@/types/categories";
import { Button } from "@/components/ui/button";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    setSearchOpen(false);
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

  // Focus the search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

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

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const getCategoryName = (slug: string): string => {
    const category = categories?.find((c) => c.slug === slug);
    return category ? category.name : slug;
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger 
                className="md:hidden h-8 w-8 pl-0 border-t border-r border-b rounded-r-md" 
                onClick={() => setOpen(!open)}
              >
                <Menu className="h-8 w-8" />
              </SidebarTrigger>
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                {pageTitle}
              </h1>
            </div>
            
            {location.pathname === '/' && (
              <div className="flex items-center gap-2">
                {/* Mobile search button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  onClick={toggleSearch}
                  aria-label={searchOpen ? "Close search" : "Open search"}
                >
                  {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
                </Button>

                {/* Category filter - always visible but compact on mobile */}
                {categories && categories.length > 0 && (
                  <div>
                    <CategoryFilter
                      selectedCategories={selectedCategories}
                      setSelectedCategories={setSelectedCategories}
                      availableCategories={categories}
                      position="top"
                      compactOnMobile={true}
                    />
                  </div>
                )}
                
                {/* Desktop search bar - always visible */}
                <div className="relative hidden md:block w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Szukaj..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile search bar - expandable */}
          {location.pathname === '/' && searchOpen && (
            <div className="relative w-full mb-4 md:hidden">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Szukaj..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
                ref={searchInputRef}
              />
            </div>
          )}

          {/* Selected categories display */}
          {location.pathname === '/' && selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategories.map((slug) => (
                <div key={slug} className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
                  {getCategoryName(slug)}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                    onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== slug))}
                  />
                </div>
              ))}
            </div>
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

export function Layout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full">
        <LayoutContent />
      </div>
    </SidebarProvider>
  );
}
