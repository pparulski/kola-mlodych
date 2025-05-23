// PageLayout.tsx
import React, { useState, useEffect, useRef } from "react"; // Added useState, useRef
import { Outlet, useLocation } from "react-router-dom";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useCategories } from "@/hooks/useCategories";
import { PageHeader } from "./PageHeader";
import { CategorySection } from "./CategorySection";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { cn } from "@/lib/utils";
import { debounce } from "@/utils/debounce"; // Assuming you have this utility

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
  } = useSearchParams();
  const { data: categories } = useCategories();
  const scrollDirection = useScrollDirection();
  const location = useLocation();

  // State to hold the measured height of the JoinBanner in pixels
  // Initialize with a sensible default (e.g., 40px which is 2.5rem if JoinBanner is often that height)
  // This helps reduce initial layout shift before the first measurement.
  const [joinBannerHeightPx, setJoinBannerHeightPx] = useState(40); 

  // Effect to measure JoinBanner height
  useEffect(() => {
    const measureBannerHeight = () => {
      const bannerElement = document.getElementById("join-banner"); // Ensure JoinBanner has id="join-banner"
      if (bannerElement) {
        const height = bannerElement.offsetHeight;
        if (height > 0) { // Only update if a valid height is measured
            setJoinBannerHeightPx(height);
        }
        // console.log("Measured JoinBanner height (px):", height);
      } else {
        // Fallback or warning if banner not found, though it should be there
        // console.warn("JoinBanner element not found for height measurement.");
        // You might set a default pixel height here if the banner is optional
        // For now, it will keep the initial useState value or last measured value.
      }
    };

    measureBannerHeight(); // Initial measure on mount

    const debouncedMeasure = debounce(measureBannerHeight, 200);
    window.addEventListener("resize", debouncedMeasure);

    // Optional: If JoinBanner's content could change causing height change without resize
    // you might need a MutationObserver or a more complex way to trigger re-measure.
    // For now, resize is the primary trigger.

    return () => {
      window.removeEventListener("resize", debouncedMeasure);
    };
  }, []); // Runs once on mount to set up listeners

  const isHeaderVisible = scrollDirection !== "down";

  // Dynamic top position for PageHeader based on measured banner height (in pixels)
  const pageHeaderVisibleTopPxStr = `${joinBannerHeightPx}px`;
  const pageHeaderHiddenTopRemStr = `-${PAGE_HEADER_MAX_HEIGHT_REM_STR}`;

  const pageHeaderTopPosition = isHeaderVisible
    ? pageHeaderVisibleTopPxStr
    : pageHeaderHiddenTopRemStr;

  // Dynamic padding top for the main content area
  const mainContentPaddingTop = isHeaderVisible
    ? `calc(${joinBannerHeightPx}px + ${PAGE_HEADER_MAX_HEIGHT_REM_STR})` // Banner + Header height
    : `${joinBannerHeightPx}px`; // Just Banner height

  // Reset scroll position and clear filters when changing routes
  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.pathname !== '/' && (searchQuery || (selectedCategories && selectedCategories.length > 0))) {
      clearFilters();
    }
  }, [location.pathname, clearFilters, searchQuery, selectedCategories]);
  
  return (
    <> {/* Using React.Fragment as root, or <div className="flex flex-col min-h-screen"> if this is the app root layout */}
      {/* 
        The outermost div of PageLayout should NOT have horizontal padding (p-3/px-3)
        if the sticky header within it needs to be truly full-width edge-to-edge for its background.
        The padding for content alignment should be applied *inside* the PageHeader and *inside* the main content area.
      */}
      <div className="flex-1 relative animate-fade-in"> {/* This div is the positioning context for sticky header */}
        
        {/* Sticky PageHeader Wrapper */}
        <div 
          id="sticky-page-header-wrapper" // ID for debugging if needed
          className={cn(
            "w-full sticky bg-background z-[9]", 
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
            // Pass any other necessary props to PageHeader
          />
        </div>
      
        {/* Main Content Area Wrapper - This div gets dynamic top padding */}
        <div 
          className="transition-all duration-300 ease-in-out" // For smooth padding animation
          style={{ paddingTop: mainContentPaddingTop }}
        >
          {/* This inner div now handles the consistent page padding for content */}
          <div className="p-3 md:p-5"> 
            <CategorySection 
                isHomePage={isHomePage}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                categories={categories}
            />
            <div className="max-w-4xl mx-auto"> {/* Constrains width of Outlet content */}
                <Outlet context={{ searchQuery, selectedCategories }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}