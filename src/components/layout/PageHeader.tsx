
import { useState, useRef, useEffect } from "react";
import { Menu, Search, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { Category } from "@/types/categories";

interface PageHeaderProps {
  pageTitle: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  categories?: Category[];
}

export function PageHeader({
  pageTitle,
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  categories
}: PageHeaderProps) {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Focus the search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);
  
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger 
            className="md:hidden h-10 w-10 p-0 border-t border-r border-b rounded-r-md rounded-l-none absolute left-0 transition-transform duration-300 ease-in-out hover:translate-x-1 hover:bg-accent/10" 
            onClick={() => setOpen(!open)}
          >
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <div className="ml-10 md:ml-0">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              {pageTitle}
            </h1>
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
    </>
  );
}
