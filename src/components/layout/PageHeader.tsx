
// src/components/layout/PageHeader.tsx
import React, { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { pauseGlobalScrollDirection, resumeGlobalScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from "@/lib/utils";
import { PageHeaderContent } from "./PageHeaderContent";
import { usePageHeaderTitle } from "./usePageHeaderTitle";
import { Category } from "@/types/categories";

interface PageHeaderProps {
  pageTitle?: string;
  title?: string;
  description?: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategories?: string[];
  setSelectedCategories?: (categories: string[]) => void;
  categories?: Category[];
  applyPagePadding?: boolean;
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
  applyPagePadding = false,
}: PageHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  
  const { displayTitle, isHomePage, shouldShowBackButton, location } = usePageHeaderTitle(pageTitle, title);
  
  useEffect(() => {
    if (displayTitle && !location.pathname.includes('/news/')) {
      document.title = `${displayTitle} - Młodzi IP`;
    }
  }, [displayTitle, location.pathname]);

  useEffect(() => {
    setSearchOpen(false);
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isHomePage && searchOpen && isMobile && searchInputRef.current) {
      searchInputRef.current.focus({ preventScroll: true });
    }
  }, [searchOpen, isMobile, isHomePage]);
  
  const toggleSearch = async () => {
    const aboutToOpen = !searchOpen;
    pauseGlobalScrollDirection();
    if (searchOpen && setSearchQuery) {
      setSearchQuery(''); 
    }
    setSearchOpen(aboutToOpen);
    await Promise.resolve(); 
    setTimeout(() => {
      resumeGlobalScrollDirection();
    }, 150);
  };

  return (
    <div 
      className={cn(
        "w-full relative",
        applyPagePadding && "p-3 md:p-5"
      )}
    >
      <div className="flex flex-col relative z-[1]">
        <PageHeaderContent 
          displayTitle={displayTitle}
          description={description}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
          shouldShowBackButton={shouldShowBackButton}
          isHomePage={isHomePage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          categories={categories}
          searchOpen={searchOpen}
          toggleSearch={toggleSearch}
          searchInputRef={searchInputRef}
        />
      </div>
    </div>
  );
}
