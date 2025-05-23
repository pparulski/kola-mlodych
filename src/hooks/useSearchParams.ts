// src/hooks/useSearchParams.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";
import { debounce } from "@/utils/debounce";

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const [actualSearchParams] = useRouterSearchParams();

  const isMounted = useRef(false); // Tracks if component has mounted
  // This ref will store the search string we *expect* to see after our navigation
  const expectedURLSearchString = useRef<string | null>(null);

  const [searchQuery, setSearchQueryState] = useState(() => actualSearchParams.get('search') || '');
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(() =>
    (actualSearchParams.get('categories') || '').split(',').filter(Boolean)
  );

  const isHomePage = location.pathname === '/';

  // Effect 1: State -> URL (Update URL when local state changes)
  const updateURL = useCallback(
    debounce((currentQuery: string, currentCategories: string[]) => {
      if (!isHomePage || !isMounted.current) return; // Don't run on initial mount or if not homepage

      const params = new URLSearchParams();
      if (currentQuery) params.set('search', currentQuery);
      if (currentCategories.length > 0) params.set('categories', currentCategories.join(','));
      
      const newQueryString = params.toString();
      const currentPathWithQuery = `${location.pathname}${newQueryString ? `?${newQueryString}` : ''}`;
      const currentFullURL = `${location.pathname}${location.search}`;

      if (currentPathWithQuery !== currentFullURL) {
        console.log(`useSearchParams (State -> URL): Navigating. New query string: "?${newQueryString}"`);
        expectedURLSearchString.current = newQueryString ? `?${newQueryString}` : ""; // Store what we expect
        navigate(currentPathWithQuery, { replace: true });
      }
    }, 300), // Debounce value
    [navigate, isHomePage, location.pathname] // Removed location.search from here
  );

  useEffect(() => {
    if (isMounted.current && isHomePage) { // Only run after mount and on homepage
      // console.log("useSearchParams (State -> URL): State changed, queueing URL update", { searchQuery, selectedCategories });
      updateURL(searchQuery, selectedCategories);
    }
  }, [searchQuery, selectedCategories, updateURL, isHomePage]);


  // Effect 2: URL -> State (Update state when URL changes externally, e.g., back/forward button)
  useEffect(() => {
    // Don't run on initial mount before state is initialized from URL
    if (!isMounted.current || !isHomePage) {
      if (!isMounted.current) {
        // This effect runs after initial state is set from URL by useState initializers
        // So, mark as mounted here.
        isMounted.current = true;
      }
      return;
    }

    // If expectedURLSearchString.current matches location.search, it means this URL change
    // was likely caused by our own navigate() call in updateURL. We've already handled state.
    // Reset the expectation and do nothing further in this effect run.
    if (expectedURLSearchString.current !== null && expectedURLSearchString.current === location.search) {
      // console.log("useSearchParams (URL -> State): URL matches expectation, sync complete.", location.search);
      expectedURLSearchString.current = null; // Reset expectation
      return;
    }
    // If we reach here, the URL change was external (e.g., back/forward, manual edit)
    // OR our navigate call resulted in a different URL string than expected (less likely with toString())
    // OR expectedURLSearchString was null (meaning we weren't expecting this specific URL change)

    const paramsFromURL = new URLSearchParams(location.search);
    const urlSearch = paramsFromURL.get('search') || '';
    const urlCategories = (paramsFromURL.get('categories') || '').split(',').filter(Boolean);

    const searchNeedsUpdate = urlSearch !== searchQuery;
    const categoriesNeedUpdate = JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories);

    if (searchNeedsUpdate || categoriesNeedUpdate) {
      console.log("useSearchParams (URL -> State): External URL change detected, updating state:", {
        urlSearch,
        urlCategories,
        currentStateSearch: searchQuery,
        currentStateCategories: selectedCategories,
      });
      if (searchNeedsUpdate) setSearchQueryState(urlSearch);
      if (categoriesNeedUpdate) setSelectedCategoriesState(urlCategories);
    }
    
    // Always clear expectation if we process an external change or if it didn't match
    expectedURLSearchString.current = null; 

  }, [location.search, isHomePage, searchQuery, selectedCategories]); // Dependencies


  const setMainSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setMainSelectedCategories = useCallback((categories: string[]) => {
    setSelectedCategoriesState(categories);
  }, []);
  
  const clearFilters = useCallback(() => {
    setSearchQueryState("");
    setSelectedCategoriesState([]);
    // updateURL will be triggered by the state changes above if on isHomePage
    // If not on homepage, and you want to clear URL, then explicit navigate is needed:
    if (!isHomePage && (location.search.includes('search=') || location.search.includes('categories='))) {
        navigate(location.pathname, {replace: true});
    }
  }, [isHomePage, navigate, location.pathname, location.search]); // Added location.search

  return {
    searchQuery,
    setSearchQuery: setMainSearchQuery,
    selectedCategories,
    setSelectedCategories: setMainSelectedCategories,
    isHomePage,
    clearFilters,
  };
}