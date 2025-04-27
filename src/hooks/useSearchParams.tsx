
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { debounce } from "@/utils/debounce";

export function useSearchParams() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  
  // Use debounced version to update URL
  const updateUrlDebounced = useCallback(
    debounce(() => {
      if (location.pathname !== '/' || isUpdatingUrl) return;
      
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
    }, 300),
    [location.pathname, searchQuery, selectedCategories, location.search, isUpdatingUrl]
  );

  // Update URL when query or categories change 
  useEffect(() => {
    updateUrlDebounced();
  }, [searchQuery, selectedCategories, updateUrlDebounced]);

  // Parse URL parameters on initial load and when URL changes
  useEffect(() => {
    if (location.pathname === '/' && !isUpdatingUrl) {
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
  }, [location.search, searchQuery, selectedCategories, isUpdatingUrl]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories
  };
}
