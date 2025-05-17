// src/components/layout/PageHeader.tsx
import React, { useState, useRef, useEffect } from "react"; // Ensure React is explicitly imported for JSX
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { Category } from "@/types/categories"; // Assuming this type is correctly defined
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/components/search/SearchBar";
import { MobileSearchToggle } from "@/components/search/MobileSearchToggle";
import { PageTitle } from "./PageTitle";
import { SidebarToggle } from "./SidebarToggle";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getPageTitle } from "@/utils/pageUtils"; // Assuming this utility exists
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { pauseGlobalScrollDirection, resumeGlobalScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  pageTitle?: string;
  title?: string;
  description?: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategories?: string[];
  setSelectedCategories?: (categories: string[]) => void;
  categories?: Category[];
  applyPagePadding?: boolean;
}

export function PageHeader({
  pageTitle,
  title,
  description,
  searchQuery = "",
  setSearchQuery = () => {}, // Default function for safety
  selectedCategories = [],
  setSelectedCategories = () => {}, // Default function for safety
  categories = [],
  applyPagePadding = false,
}: PageHeaderProps) {
  const location = useLocation();
  const { slug } = useParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar(); // Assuming useSidebar provides toggleSidebar
  const navigate = useNavigate();
  
  
  const { data: dynamicPageData } = useQuery({
    queryKey: ['page-title', location.pathname, slug],
    queryFn: async () => {
      if (location.pathname.includes('/news/')) {
        return "Aktualności";
      }
      if (slug && !location.pathname.includes('/news/') && !location.pathname.includes('/category/')) {
        const { data } = await supabase
          .from('static_pages')
          .select('title')
          .eq('slug', slug)
          .maybeSingle();
        return data?.title || null; // Return null if not found
      }
      if (location.pathname.includes('/category/') && slug) {
        const { data } = await supabase
          .from('categories')
          .select('name')
          .eq('slug', slug)
          .maybeSingle();
        return data?.name || null; // Return null if not found
      }
      return null;
    },
    enabled: !!location.pathname, // Simpler enabled condition
    staleTime: 5 * 60 * 1000, // Example: 5 minutes stale time
    refetchOnWindowFocus: false, // Potentially disable to reduce re-fetches
  });
  
  const displayTitle = dynamicPageData || pageTitle || title || getPageTitle(location.pathname);
  const isHomePage = location.pathname === '/';
  const shouldShowBackButton = location.pathname.includes('/news/') || 
                             location.pathname.includes('/article/');

  useEffect(() => {
    if (displayTitle && !location.pathname.includes('/news/')) {
      document.title = `${displayTitle} - Młodzi IP`;
    }
  }, [displayTitle, location.pathname]);

  useEffect(() => {
    setSearchOpen(false); // Close search on route change
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isHomePage && searchOpen && isMobile && searchInputRef.current) {
      searchInputRef.current.focus({ preventScroll: true });
    }
  }, [searchOpen, isMobile, isHomePage]);
  
  const toggleSearch = async () => {
    const aboutToOpen = !searchOpen;
    pauseGlobalScrollDirection();
    if (searchOpen && setSearchQuery) {
      setSearchQuery(''); 
    }
    setSearchOpen(aboutToOpen);
    await Promise.resolve(); 
    setTimeout(() => {
      resumeGlobalScrollDirection();
    }, 150);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div 
      className={cn(
        "w-full relative", // Added 'relative' for gradient positioning
        applyPagePadding && "p-3 md:p-5"
      )}
    >
      {/* Main content of the header */}
      <div className="flex flex-col relative z-[1]"> {/* Added relative z-10 to ensure content is above gradient */}
        <div className="flex items-center justify-between w-full"> {/* Removed mb-2 from here, manage spacing below */}
          <div className="flex items-center gap-2">
            {isMobile && (
              <SidebarToggle toggleSidebar={toggleSidebar} />
            )}
            <PageTitle title={displayTitle} description={description} />
          </div>

          <div className="flex items-center gap-2">
            {shouldShowBackButton && (
              <Button 
                variant="outline"
                onClick={handleGoBack}
                className="gap-2" // Ensure button styles handle icon + text correctly
              >
                <ArrowLeft className="h-4 w-4" />
                Wróć
              </Button>
            )}
            
            {isHomePage && !isMobile && (
              <>
                <div className="relative w-64"> {/* Consider max-w-xs or similar for responsiveness */}
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
        
        {/* Conditionally rendered search bar for mobile */}
        {isHomePage && searchOpen && isMobile && (
          <div className="w-full mt-2 animate-fade-in"> {/* Added mb-2 to ensure space before gradient starts if search is open */}
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              inputRef={searchInputRef}
              className="w-full"
              isCompact={true} // Assuming you want compact search on mobile
            />
          </div>


        )}
      </div>
    </div>
  );
}