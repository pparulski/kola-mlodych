
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { Category } from "@/types/categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { PageTitle } from "./PageTitle";

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
      <div className="flex items-center justify-between w-full mb-2">
        <PageTitle title={displayTitle} description={description} />
        
        {isHomePage && (
          <div className="flex items-center gap-2">
            {!isMobile && (
              <div className="relative hidden md:block w-64">
                <SearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            )}
            
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={toggleSearch}
              aria-label={searchOpen ? "Close search" : "Open search"}
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>

            {categories && categories.length > 0 && (
              <>
                <div className="hidden md:block">
                  <CategoryFilter
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    availableCategories={categories}
                    position="top"
                    compactOnMobile={false}
                  />
                </div>
                
                <div className="block md:hidden">
                  <CategoryFilter
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    availableCategories={categories}
                    position="top"
                    compactOnMobile={true}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {isHomePage && searchOpen && isMobile && (
        <div className="w-full">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            inputRef={searchInputRef}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
