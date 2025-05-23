
// PageLayout.tsx
import React, { useState, useEffect, useRef } from "react"; 
import { Outlet, useLocation } from "react-router-dom";
import { useEnhancedSearchParams } from "@/hooks/useEnhancedSearchParams";
import { useCategories } from "@/hooks/useCategories";
import { PageHeader } from "./PageHeader";
import { CategorySection } from "./CategorySection";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";
import { debounce } from "@/utils/debounce"; 

// Max height of PageHeader in REMs (when search is open: 120px / 16px/rem = 7.5rem)
const PAGE_HEADER_MAX_HEIGHT_REM_STR = "7.5rem";

export function PageLayout() {
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCategories, 
    setSelectedCategories, 
    isHomePage, 
    clearFilters 
  } = useEnhancedSearchParams();
  
  const { data: categories } = useCategories();
  const scrollDirection = useScrollDirection();
  const location = useLocation();
  const previousPathname = useRef(location.pathname);

  // State to hold the measured height of the JoinBanner in pixels
  const [joinBannerHeightPx, setJoinBannerHeightPx] = useState(40); 

  // Effect to measure JoinBanner height
  useEffect(() => {
    const measureBannerHeight = () => {
      const bannerElement = document.getElementById("join-banner");
      if (bannerElement) {
        const height = bannerElement.offsetHeight;
        if (height > 0) {
            setJoinBannerHeightPx(height);
        }
      }
    };

    measureBannerHeight();

    const debouncedMeasure = debounce(measureBannerHeight, 200);
    window.addEventListener("resize", debouncedMeasure);

    return () => {
      window.removeEventListener("resize", debouncedMeasure);
    };
  }, []);

  const isHeaderVisible = scrollDirection !== "down";

  // Dynamic top position for PageHeader based on measured banner height (in pixels)
  const pageHeaderVisibleTopPxStr = `${joinBannerHeightPx}px`;
  const pageHeaderHiddenTopRemStr = `-${PAGE_HEADER_MAX_HEIGHT_REM_STR}`;

  const pageHeaderTopPosition = isHeaderVisible
    ? pageHeaderVisibleTopPxStr
    : pageHeaderHiddenTopRemStr;

  // Reset scroll position when changing routes
  useEffect(() => {
    // Only act when actually changing content routes (not just query params)
    if (previousPathname.current !== location.pathname) {
      window.scrollTo(0, 0);
      // Route change handling now happens in the useEnhancedSearchParams hook
      previousPathname.current = location.pathname;
    }
  }, [location.pathname]);
  
  return (
    <> 
      <div className="flex-1 relative animate-fade-in"> 
        
        {/* Sticky PageHeader Wrapper */}
        <div 
          id="sticky-page-header-wrapper" 
          className={cn(
            "w-full sticky bg-background z-[9]", 
            "transition-all duration-300 ease-in-out"
          )}
          style={{ top: pageHeaderTopPosition }} 
        >
          <PageHeader 
            applyPagePadding={true} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            categories={categories}
          />
        </div>
      
        {/* Main Content Area Wrapper */}
        <div 
          className="transition-all duration-300 ease-in-out" 
        >
          {/* This inner div now handles the consistent page padding for content */}
          <div className="p-3 md:p-5"> 
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
    </>
  );
}
