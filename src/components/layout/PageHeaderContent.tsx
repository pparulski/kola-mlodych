
import React from "react";
import { useNavigate } from "react-router-dom";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { Category } from "@/types/categories";
import { PageTitle } from "./PageTitle";
import { SidebarToggle } from "./SidebarToggle";
import { SearchBar } from "@/components/search/SearchBar";
import { MobileSearchToggle } from "@/components/search/MobileSearchToggle";
import { BackButton } from "./BackButton";

interface PageHeaderContentProps {
  displayTitle: string;
  description?: string;
  isMobile: boolean;
  toggleSidebar: () => void;
  shouldShowBackButton: boolean;
  isHomePage: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategories?: string[];
  setSelectedCategories?: (categories: string[]) => void;
  categories?: Category[];
  searchOpen: boolean;
  toggleSearch: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export const PageHeaderContent = ({
  displayTitle,
  description,
  isMobile,
  toggleSidebar,
  shouldShowBackButton,
  isHomePage,
  searchQuery = "",
  setSearchQuery = () => {},
  selectedCategories = [],
  setSelectedCategories = () => {},
  categories = [],
  searchOpen,
  toggleSearch,
  searchInputRef
}: PageHeaderContentProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    try {
      const historyState = (window.history && (window.history as any).state) || {};
      const canGoBack = (typeof historyState.idx === 'number' && historyState.idx > 0) || window.history.length > 1;
      if (canGoBack) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {isMobile && (
            <SidebarToggle toggleSidebar={toggleSidebar} />
          )}
          <PageTitle title={displayTitle} description={description} />
        </div>

        <div className="flex items-center gap-2">
          {shouldShowBackButton && (
            <BackButton onClick={handleGoBack} />
          )}
          
          {isHomePage && !isMobile && (
            <>
              <div className="relative w-64">
                <SearchBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              
              {categories && categories.length > 0 && (
                <CategoryFilter
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  availableCategories={categories}
                  position="top"
                  compactOnMobile={false}
                />
              )}
            </>
          )}

          {isHomePage && isMobile && (
            <>
              <MobileSearchToggle 
                isOpen={searchOpen} 
                toggleSearch={toggleSearch} 
              />
              
              {categories && categories.length > 0 && (
                <CategoryFilter
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  availableCategories={categories}
                  position="top"
                  compactOnMobile={true}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {isHomePage && searchOpen && isMobile && (
        <div className="w-full mt-2 animate-fade-in">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            inputRef={searchInputRef}
            className="w-full"
            isCompact={true}
          />
        </div>
      )}
    </>
  );
};
