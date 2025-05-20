
// PageLayout.tsx
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useCategories } from "@/hooks/useCategories";
import { PageHeader } from "./PageHeader";
import { CategorySection } from "./CategorySection";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

// Heights for animation and positioning
const JOIN_BANNER_HEIGHT_REM = 2.5; // 40px / 16 = 2.5rem (ACCURATE)
const PAGE_HEADER_MAX_HEIGHT_REM = 7.5; // 120px / 16 = 7.5rem (when search is open)

const JOIN_BANNER_HEIGHT_CSS_VAL = `${JOIN_BANNER_HEIGHT_REM}rem`;
const PAGE_HEADER_MAX_HEIGHT_CSS_VAL = `${PAGE_HEADER_MAX_HEIGHT_REM}rem`;

export function PageLayout() {
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, isHomePage, clearFilters } = useSearchParams();
  const { data: categories } = useCategories();
  const scrollDirection = useScrollDirection();
  const location = useLocation();

  const isHeaderVisible = scrollDirection !== "down";

  const pageHeaderTopPosition = isHeaderVisible
    ? JOIN_BANNER_HEIGHT_CSS_VAL
    : `-${PAGE_HEADER_MAX_HEIGHT_CSS_VAL}`; // Slide up by its own max height

  // Reset scroll position and clear filters when changing routes
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Only clear filters when navigating away from homepage
    if (location.pathname !== '/' && (searchQuery || selectedCategories.length > 0)) {
      clearFilters();
    }
  }, [location.pathname, clearFilters, searchQuery, selectedCategories]);
  
  return (
    <>
      <div className="flex-1 relative animate-fade-in"> {/* Overall page container */}
        
        {/* Sticky PageHeader Wrapper */}
        <div 
          id="sticky-page-header-wrapper"
          className={cn(
            "w-full sticky bg-background z-[9]", // Solid background for header area
            "transition-all duration-300 ease-in-out"
          )}
          style={{ top: pageHeaderTopPosition }} // Dynamic top for animation
        >
          <PageHeader 
            applyPagePadding={true} // PageHeader handles its own internal p-3 md:p-5
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            categories={categories}
          />
        </div>
      
        {/* Main Content Area */}
        <div className="pt-0 pb-3 pr-3 pl-3 md:pt-0 md:pb-3 md:pr-5 md:pl-5"> 
            <CategorySection 
                isHomePage={isHomePage}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                categories={categories}
            />
            <div className="max-w-4xl mx-auto">
                <Outlet context={{ searchQuery, selectedCategories }} />
            </div>
        </div>
      </div>
    </>
  );
}
