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


  const pageHeaderTopClass = scrollDirection === "down"
    ? `-top-[${PAGE_HEADER_MAX_HEIGHT_REM}rem]`
    : `top-[${JOIN_BANNER_HEIGHT_REM}rem]`;
  
  // console.log("Applied pageHeaderTopClass:", pageHeaderTopClass);

  useEffect(() => {
  window.scrollTo(0, 0);
  }, [location.pathname]);

  
  return (
    <div className="flex-1 relative animate-fade-in">
      {/* Tailwind JIT Hint: Ensure these classes are generated */}
      {/* <div className="hidden top-[2rem] -top-[6rem]"></div> */}
      {/* Or, more reliably, ensure they are used somewhere, even if conditionally,
          or Tailwind might not pick them up if it only sees the variable.
          The explicit strings in the ternary should be enough, though.
      */}

      <div 
        className={cn(
          "w-full sticky bg-background z-[9]",
          "transition-all duration-300 ease-in-out", // Ensure transition is for 'top' or 'all'
          pageHeaderTopClass
        )}
        // It's generally better for transitions if the element has a somewhat consistent height
        // or if the content being revealed/hidden doesn't cause massive reflows.
        // The `PageHeader` itself should ideally not change height dramatically during the transition.
      >
        <PageHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          categories={categories}
          applyPagePadding={true} // New prop
        />
      </div>

      {/* Content below the header */}
      {/* The sticky header will overlay this content initially.
          The content needs to be aware of the header's space.
          If the header has a known max height, add top padding/margin to this content wrapper.
          Or, the sticky element itself creates the offset.
      */}
      <div className="p-3 md:p-5">
      <div className="mt-0"> {/* Content starts immediately below where the header *would* flow */}
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