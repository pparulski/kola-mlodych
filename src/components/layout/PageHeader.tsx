
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { Category } from "@/types/categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/components/search/SearchBar";
import { MobileSearchToggle } from "@/components/search/MobileSearchToggle";
import { PageTitle } from "./PageTitle";
import { SidebarToggle } from "./SidebarToggle";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getPageTitle } from "@/utils/pageUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useScrollAway } from "@/hooks/useScrollAway";

interface PageHeaderProps {
  pageTitle?: string;
  title?: string;
  description?: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategories?: string[];
  setSelectedCategories?: (categories: string[]) => void;
  categories?: Category[];
}

export function PageHeader({
  pageTitle,
  title,
  description,
  searchQuery = "",
  setSearchQuery = () => {},
  selectedCategories = [],
  setSelectedCategories = () => {},
  categories = [],
}: PageHeaderProps) {
  const location = useLocation();
  const { slug } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const isHeaderVisible = useScrollAway(10);
  
  // Get the appropriate title for the current page
  const { data: dynamicPageData } = useQuery({
    queryKey: ['page-title', location.pathname, slug],
    queryFn: async () => {
      // For news articles, return "Aktualności" for the header
      if (location.pathname.includes('/news/')) {
        return "Aktualności";
      }
      
      // For static pages, get the title from static_pages
      if (slug && !location.pathname.includes('/news/') && !location.pathname.includes('/category/')) {
        const { data } = await supabase
          .from('static_pages')
          .select('title')
          .eq('slug', slug)
          .maybeSingle();
        return data?.title;
      }
      
      // For category pages
      if (location.pathname.includes('/category/') && slug) {
        const { data } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', slug)
          .maybeSingle();
        return data?.name ? `Kategoria: ${data.name}` : null;
      }
      
      return null;
    },
    enabled: !!location.pathname && (!!slug || location.pathname === '/'),
  });
  
  // Use dynamic data if available, otherwise fall back to props or path-based title
  const displayTitle = dynamicPageData || pageTitle || title || getPageTitle(location.pathname);
  
  // Set document title based on the page title
  useEffect(() => {
    if (displayTitle && !location.pathname.includes('/news/')) {
      document.title = `${displayTitle} - Młodzi IP`;
    }
  }, [displayTitle, location.pathname]);

  useEffect(() => {
    setSearchOpen(false);
    
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, [location.pathname]);
  
  const toggleSearch = () => {
    // If we are currently open and about to close, clear the search query
    if (searchOpen) {
      setSearchQuery(''); 
    }
    setSearchOpen(!searchOpen);
  };

  const isHomePage = location.pathname === '/';
  const shouldShowBackButton = location.pathname.includes('/news/') || 
                             location.pathname.includes('/article/');

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header 
      className={`w-full bg-background z-40 sticky top-[40px] transition-all duration-500 transform ${
        isMobile && !isHeaderVisible ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ willChange: 'transform' }} // Performance optimization
    >
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-2">
            {isMobile && <SidebarToggle toggleSidebar={toggleSidebar} />}
            <PageTitle title={displayTitle} description={description} />
          </div>

          <div className="flex items-center gap-2">
            {shouldShowBackButton && (
              <Button 
                variant="outline"
                onClick={handleGoBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Wróć
              </Button>
            )}
            
            {isHomePage && !isMobile && (
              <>
                <div className="relative w-64">
                  <SearchBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </div>
                
                {categories && categories.length > 0 && (
                  <CategoryFilter
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    availableCategories={categories}
                    position="top"
                    compactOnMobile={false}
                  />
                )}
              </>
            )}

            {isHomePage && isMobile && (
              <>
                <MobileSearchToggle 
                  isOpen={searchOpen} 
                  toggleSearch={toggleSearch} 
                />
                
                {categories && categories.length > 0 && (
                  <CategoryFilter
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    availableCategories={categories}
                    position="top"
                    compactOnMobile={true}
                  />
                )}
              </>
            )}
          </div>
        </div>
        
        {isHomePage && searchOpen && isMobile && (
          <div className="w-full mt-2">
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              inputRef={searchInputRef}
              className="w-full"
            />
          </div>
        )}
      </div>
    </header>
  );
}
