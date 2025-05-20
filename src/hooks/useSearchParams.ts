
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { debounce } from "@/utils/debounce";

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  // Use refs to track initialization state
  const initialized = useRef(false);
  const updatingURL = useRef(false);
  
  // Use refs for initial values to avoid state initialization issues
  const initialSearch = new URLSearchParams(location.search).get('search') || '';
  const initialCategories = (new URLSearchParams(location.search).get('categories') || '').split(',').filter(Boolean);
  
  // State management
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);

  // --- State derived from location ---
  const isHomePage = location.pathname === '/';
  const currentParams = new URLSearchParams(location.search);
  const urlSearch = currentParams.get('search') || '';
  const urlCategories = (currentParams.get('categories') || '').split(',').filter(Boolean);

  // --- Effect 1: Initialize state from URL on first load or route change ---
  useEffect(() => {
    if (isHomePage) {
      // Prevent initialization loops by using a ref
      if (!initialized.current || updatingURL.current) {
        // Only sync from URL if we haven't initialized or if we're in the middle of an update
        if (!initialized.current || 
            urlSearch !== searchQuery || 
            JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories)) {
          
          console.log(`useSearchParams: Initializing state from URL:`, {
            urlSearch,
            urlCategories
          });
          
          // Update state without triggering the state->URL effect
          updatingURL.current = true;
          setSearchQuery(urlSearch);
          setSelectedCategories(urlCategories);
          initialized.current = true;
          
          // Reset the updating flag after state updates are processed
          setTimeout(() => {
            updatingURL.current = false;
          }, 10);
        }
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
      initialized.current = false;
    }
  }, [location.pathname, location.search, isHomePage, urlSearch, urlCategories, searchQuery, selectedCategories]);

  // --- Debounced function to update URL from state ---
  const updateUrlFromState = useCallback(
    debounce((query: string, categories: string[]) => {
      if (!isHomePage || updatingURL.current) return;
      
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
        
        // Set flag to indicate we're updating the URL
        updatingURL.current = true;
        navigate(`${location.pathname}?${newSearchString}`, { replace: true });
        
        // Reset the updating flag after navigation
        setTimeout(() => {
          updatingURL.current = false;
        }, 100);
      }
    }, 500), // Increased debounce time to further prevent race conditions
    [location.pathname, navigate, isHomePage]
  );

  // --- Update URL when state changes ---
  useEffect(() => {
    // Only update URL if we've initialized and we're not currently processing a URL->state update
    if (initialized.current && !updatingURL.current) {
      updateUrlFromState(searchQuery, selectedCategories);
    }
  }, [searchQuery, selectedCategories, updateUrlFromState]);

  // Clear search function that can be called externally
  const clearFilters = useCallback(() => {
    if (updatingURL.current) return;
    
    setSearchQuery("");
    setSelectedCategories([]);
    
    // Clear URL params as well if on homepage
    if (isHomePage) {
      updatingURL.current = true;
      navigate(location.pathname, { replace: true });
      setTimeout(() => {
        updatingURL.current = false;
      }, 100);
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
