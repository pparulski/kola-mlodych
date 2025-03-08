
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { Category } from "@/types/categories";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  // Focus the search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);
  
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

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 md:gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              {displayTitle}
            </h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
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
              <div className="hidden md:block">
                <CategoryFilter
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  availableCategories={categories}
                  position="top"
                  compactOnMobile={false}
                />
              </div>
            )}
            
            {/* Mobile category filter - compact version */}
            {categories && categories.length > 0 && (
              <div className="block md:hidden">
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

      {/* Mobile search bar - positioned below the header with full width */}
      {location.pathname === '/' && searchOpen && isMobile && (
        <div className="w-full mt-4">
          <div className="relative w-full">
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
        </div>
      )}
    </div>
  );
}
