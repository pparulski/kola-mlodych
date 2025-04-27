
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { debounce } from "@/utils/debounce";

export function useSearchParams() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);

  const isHomePage = location.pathname === '/';

  // Directly update the URL with no debounce to ensure server-side search works properly
  const updateUrl = useCallback(() => {
    if (!isHomePage || isUpdatingUrl) return;
    
    const params = new URLSearchParams(location.search);
    
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    } else {
      params.delete('categories');
    }
    
    const newSearch = params.toString();
    const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    
    setIsUpdatingUrl(true);
    window.history.replaceState(null, '', newUrl);
    setTimeout(() => setIsUpdatingUrl(false), 50);
  }, [isHomePage, searchQuery, selectedCategories, location.pathname, location.search, isUpdatingUrl]);

  // Parse URL parameters on initial load and when URL changes
  useEffect(() => {
    if (isHomePage && !isUpdatingUrl) {
      const params = new URLSearchParams(location.search);
      
      const searchParam = params.get('search');
      if (searchParam && searchParam !== searchQuery) {
        setSearchQuery(searchParam);
      }
      
      const categoriesParam = params.get('categories');
      if (categoriesParam) {
        const newCategories = categoriesParam.split(',');
        if (JSON.stringify(newCategories) !== JSON.stringify(selectedCategories)) {
          setSelectedCategories(newCategories);
        }
      }
    }
  }, [location.search, isHomePage, searchQuery, selectedCategories, isUpdatingUrl]);

  // Update URL when parameters change - immediately, not debounced
  useEffect(() => {
    updateUrl();
  }, [searchQuery, selectedCategories, updateUrl]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    isHomePage
  };
}
