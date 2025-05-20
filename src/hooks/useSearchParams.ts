
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { debounce } from "@/utils/debounce";

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [internalStateInitialized, setInternalStateInitialized] = useState(false);

  // --- State derived from location ---
  const isHomePage = location.pathname === '/';
  const currentParams = new URLSearchParams(location.search);
  const urlSearch = currentParams.get('search') || '';
  const urlCategories = (currentParams.get('categories') || '').split(',').filter(Boolean);

  // --- Effect 1: Initialize state from URL on first load or route change ---
  useEffect(() => {
    if (isHomePage) {
      // Only apply URL params to state if we haven't initialized yet or if the URL changed
      // This prevents a loop where state changes URL, URL changes state, etc.
      if (!internalStateInitialized || 
          urlSearch !== searchQuery || 
          JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories)) {
            
        console.log(`useSearchParams: Initializing state from URL:`, {
          urlSearch,
          urlCategories
        });
        
        setSearchQuery(urlSearch);
        setSelectedCategories(urlCategories);
        setInternalStateInitialized(true);
      }
    } else {
      // Clear search state when not on home page
      if (searchQuery !== "") {
        console.log("useSearchParams: Not on home page, clearing search query state.");
        setSearchQuery("");
      }
      
      // Clear category state when not on home page
      if (selectedCategories.length > 0) {
        console.log("useSearchParams: Not on home page, clearing category filter state.");
        setSelectedCategories([]);
      }
      
      // Reset initialization flag when leaving homepage
      if (internalStateInitialized) {
        setInternalStateInitialized(false);
      }
    }
  }, [location.pathname, location.search, isHomePage]);

  // --- Debounced function to update URL from state ---
  // Use debounce to prevent too frequent URL updates
  const updateUrlFromState = useCallback(
    debounce((query: string, categories: string[]) => {
      if (!isHomePage) return;
      
      const params = new URLSearchParams();
      
      if (query) {
        params.set('search', query);
      }
      
      if (categories.length > 0) {
        params.set('categories', categories.join(','));
      }
      
      const newSearchString = params.toString();
      const currentSearchString = new URLSearchParams(location.search).toString();
      
      // Only update if the search parameters actually changed
      if (newSearchString !== currentSearchString) {
        console.log("useSearchParams: Updating URL from state:", {
          search: query,
          categories
        });
        navigate(`${location.pathname}?${newSearchString}`, { replace: true });
      }
    }, 300),
    [location.pathname, navigate, isHomePage]
  );

  // --- Update URL when state changes ---
  useEffect(() => {
    if (internalStateInitialized) {
      updateUrlFromState(searchQuery, selectedCategories);
    }
  }, [searchQuery, selectedCategories, updateUrlFromState, internalStateInitialized]);

  // Clear search function that can be called externally
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
    
    // Clear URL params as well if on homepage
    if (isHomePage) {
      navigate(location.pathname, { replace: true });
    }
  }, [isHomePage, navigate, location.pathname]);

  // Return the state, setters, and clear function
  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    isHomePage,
    clearFilters
  };
}
