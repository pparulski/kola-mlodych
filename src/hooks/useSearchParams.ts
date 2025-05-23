// src/hooks/useSearchParams.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";
import { debounce } from "@/utils/debounce"; // Assuming this is your working debounce

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const [actualSearchParams] = useRouterSearchParams(); // Renamed for clarity

  // Refs to manage synchronization and prevent loops
  const isInitializing = useRef(true); // To handle initial load
  const isUpdatingURLFromState = useRef(false); // Flag to indicate state -> URL update is in progress

  // Initialize state from URL ONLY ONCE on initial mount
  const [searchQuery, setSearchQueryState] = useState(() => actualSearchParams.get('search') || '');
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(() => 
    (actualSearchParams.get('categories') || '').split(',').filter(Boolean)
  );

  const isHomePage = location.pathname === '/';

  // Log initial state values
  useEffect(() => {
    if (isInitializing.current) {
      console.log("useSearchParams: Initial state from URL", {
        searchQuery,
        selectedCategories,
        pathname: location.pathname,
      });
      isInitializing.current = false;
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  // Debounced function to update URL from state (state -> URL)
  const updateURL = useCallback(
    debounce((currentQuery: string, currentCategories: string[]) => {
      if (!isHomePage || isInitializing.current) return; // Don't update URL if not on homepage or still initializing

      isUpdatingURLFromState.current = true; // Set flag BEFORE navigation

      const params = new URLSearchParams();
      if (currentQuery) params.set('search', currentQuery);
      if (currentCategories.length > 0) params.set('categories', currentCategories.join(','));
      
      const newQueryString = params.toString();
      // current location.search includes '?' if params exist, or is empty
      const existingQueryString = location.search.startsWith('?') ? location.search.substring(1) : location.search;

      if (newQueryString !== existingQueryString) {
        console.log(`useSearchParams: (State -> URL) Updating URL from "${existingQueryString}" to "${newQueryString}"`);
        navigate(`${location.pathname}${newQueryString ? `?${newQueryString}` : ''}`, { 
          replace: true 
        });
      }

      // Reset flag after navigation might have occurred and subsequent effects might run
      // Use a timeout to ensure it's reset after router updates propagate
      setTimeout(() => {
        isUpdatingURLFromState.current = false;
      }, 0); // Small timeout to push to next event loop tick
    }, 300), // Debounce time
    [navigate, isHomePage, location.pathname, location.search] // location.search to re-create if base URL changes
  );

  // Effect to trigger URL update when local state (searchQuery, selectedCategories) changes
  useEffect(() => {
    // Don't run on initial mount if state was derived from URL, or if not on home page
    if (isInitializing.current || !isHomePage) return;

    // console.log("useSearchParams: State changed, triggering updateURL", { searchQuery, selectedCategories });
    updateURL(searchQuery, selectedCategories);
  }, [searchQuery, selectedCategories, updateURL, isHomePage]);


  // Effect to sync URL parameters to state (URL -> state), e.g., browser back/forward
  useEffect(() => {
    // Don't run on initial mount (already handled) or if we are currently pushing state to URL
    if (isInitializing.current || isUpdatingURLFromState.current || !isHomePage) {
      return;
    }

    const paramsFromURL = new URLSearchParams(location.search);
    const urlSearch = paramsFromURL.get('search') || '';
    const urlCategories = (paramsFromURL.get('categories') || '').split(',').filter(Boolean);

    const searchNeedsUpdate = urlSearch !== searchQuery;
    const categoriesNeedUpdate = JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories);

    if (searchNeedsUpdate || categoriesNeedUpdate) {
      console.log("useSearchParams: (URL -> State) URL changed externally, updating state", {
        urlSearch,
        urlCategories,
        currentStateSearch: searchQuery,
        currentStateCategories: selectedCategories,
      });
      if (searchNeedsUpdate) {
        setSearchQueryState(urlSearch);
      }
      if (categoriesNeedUpdate) {
        setSelectedCategoriesState(urlCategories);
      }
    }
  }, [location.search, isHomePage, searchQuery, selectedCategories]); // Listen to location.search and local state

  // Wrapped setters to potentially intercept or add logic if needed in the future
  const setMainSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setMainSelectedCategories = useCallback((categories: string[]) => {
    setSelectedCategoriesState(categories);
  }, []);
  
  const clearFilters = useCallback(() => {
    console.log("useSearchParams: Clearing filters");
    isUpdatingURLFromState.current = true; // Prevent URL -> State sync during this manual clear
    setSearchQueryState("");
    setSelectedCategoriesState([]);
    if (isHomePage) {
      navigate(location.pathname, { replace: true }); // Navigate to base path without params
    }
    setTimeout(() => {
      isUpdatingURLFromState.current = false;
    }, 0);
  }, [isHomePage, navigate, location.pathname]);

  return {
    searchQuery,
    setSearchQuery: setMainSearchQuery,
    selectedCategories,
    setSelectedCategories: setMainSelectedCategories,
    isHomePage,
    clearFilters,
  };
}