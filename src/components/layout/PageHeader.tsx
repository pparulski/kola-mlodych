
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { Category } from "@/types/categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/components/search/SearchBar";
import { MobileSearchToggle } from "@/components/search/MobileSearchToggle";
import { PageTitle } from "./PageTitle";
import { SidebarToggle } from "./SidebarToggle";

interface PageHeaderProps {
  pageTitle?: string;
  title?: string;
  description?: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategories?: string[];
  setSelectedCategories?: (categories: string[]) => void;
  categories?: Category[];
  toggleSidebar?: () => void;
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
  toggleSidebar,
}: PageHeaderProps) {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  const displayTitle = pageTitle || title || "";
  
  useEffect(() => {
    setSearchOpen(false);
    
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, [location.pathname]);
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const isHomePage = location.pathname === '/';

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between w-full mb-2">
          <PageTitle title={displayTitle} description={description} />
          
          {isHomePage && (
            <div className="hidden md:flex items-center gap-2">
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
            </div>
          )}

          {isHomePage && isMobile && (
            <div className="flex items-center gap-2">
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
            </div>
          )}
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
    </div>
  );
}
