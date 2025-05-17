
// PageLayout.tsx
import React, { useEffect } from "react"; // Import React for useEffect
import { Outlet, useLocation } from "react-router-dom";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useCategories } from "@/hooks/useCategories";
import { PageHeader } from "./PageHeader";
import { CategorySection } from "./CategorySection";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";

const JOIN_BANNER_HEIGHT_REM = 2; 
const PAGE_HEADER_MAX_HEIGHT_REM = 6; 

export function PageLayout() {
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories, isHomePage } = useSearchParams();
  const { data: categories } = useCategories();
  const scrollDirection = useScrollDirection();
  const location = useLocation();

  const isScrollingUp = scrollDirection === "up";
  
  // Fix the dynamic class - use a literal string instead of a template literal with values
  const pageHeaderTopClass = scrollDirection === "down"
    ? "-top-24" // Fixed value instead of template literal with variables
    : `top-[${JOIN_BANNER_HEIGHT_REM}rem]`;

  // Reset scroll position on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex-1 relative animate-fade-in">
      <div 
        className={cn(
          "w-full sticky bg-background z-[9]",
          "transition-all duration-300 ease-in-out",
          pageHeaderTopClass
        )}
      >
        <PageHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          categories={categories}
          applyPagePadding={true}
          isScrollingUp={isScrollingUp}
        />
      </div>

      <div className="p-3 md:p-5">
      <div className="mt-0">
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
    </div>
  );
}
