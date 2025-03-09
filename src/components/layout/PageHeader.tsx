
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
  title?: string; // For backward compatibility
  description?: string; // For backward compatibility
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategories?: string[];
  setSelectedCategories?: (categories: string[]) => void;
  categories?: Category[];
}

export function PageHeader({
  pageTitle,
  title, // Support for old prop
  description, // Support for old prop
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
  
  // Use title prop as fallback for pageTitle
  const displayTitle = pageTitle || title || "";
  
  // Reset search state when navigating away
  useEffect(() => {
    setSearchOpen(false);
    
    // Add meta viewport tag reset to prevent zoom issues on mobile
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
    <div className="flex flex-col w-full">
      {/* Page title section with search and categories in one row */}
      <div className="flex items-center justify-between w-full mb-2">
        {/* Title */}
        <PageTitle title={displayTitle} description={description} />
        
        {isHomePage && (
          <div className="flex items-center gap-2">
            {/* Desktop search bar - fixed width */}
            {!isMobile && (
              <div className="relative hidden md:block w-64">
                <SearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            )}
            
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

            {/* Category filters */}
            {categories && categories.length > 0 && (
              <>
                {/* Desktop category filter */}
                <div className="hidden md:block">
                  <CategoryFilter
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    availableCategories={categories}
                    position="top"
                    compactOnMobile={false}
                  />
                </div>
                
                {/* Mobile category filter - compact version */}
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
      
      {/* Mobile search bar - only shown when search is open */}
      {isHomePage && searchOpen && isMobile && (
        <div className="w-full mt-1">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            inputRef={searchInputRef}
          />
        </div>
      )}
    </div>
  );
}
