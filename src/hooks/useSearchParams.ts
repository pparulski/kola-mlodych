
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // --- State derived from location ---
  const isHomePage = location.pathname === '/';
  const currentParams = new URLSearchParams(location.search);
  const urlSearch = currentParams.get('search') || '';
  const urlCategories = (currentParams.get('categories') || '').split(',').filter(Boolean);

  // --- Effect 1: Update STATE from URL ---
  // This effect runs when the component mounts or the actual URL search string changes
  useEffect(() => {
    if (isHomePage) {
      // Update state only if it differs from the current URL parameters
      if (urlSearch !== searchQuery) {
        console.log(`useSearchParams: Updating state searchQuery from URL: "${urlSearch}"`);
        setSearchQuery(urlSearch);
      }
      // Compare arrays carefully
      if (JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories)) {
        console.log(`useSearchParams: Updating state selectedCategories from URL:`, urlCategories);
        setSelectedCategories(urlCategories);
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
    }
    // We want this to run whenever the location changes or homepage status changes
  }, [location.search, location.pathname, isHomePage, urlSearch, urlCategories]);

  // --- Effect 2: Update URL from STATE ---
  // This effect runs when the user *intends* to change the search/categories state
  useEffect(() => {
    // Only trigger URL update if on the home page
    if (isHomePage) {
        const params = new URLSearchParams(location.search);
        const currentUrlSearch = params.get('search') || '';
        const currentUrlCategories = params.get('categories') || '';
        const newCategoriesString = selectedCategories.join(',');

        let needsUpdate = false;

        // Compare desired state with current URL state
        if (searchQuery !== currentUrlSearch) {
            if (searchQuery) {
                params.set('search', searchQuery);
            } else {
                params.delete('search');
            }
            needsUpdate = true;
        }

        // Compare desired state with current URL state
        if (newCategoriesString !== currentUrlCategories) {
             if (selectedCategories.length > 0) {
                params.set('categories', newCategoriesString);
            } else {
                params.delete('categories');
            }
            needsUpdate = true;
        }

        // Only update URL if something actually needs to change
        if (needsUpdate) {
            console.log("useSearchParams: Updating URL from state change.");
            // Use navigate with replace: true to update URL without adding history entries
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        }
    }
  }, [searchQuery, selectedCategories, isHomePage, location.pathname, navigate, location.search]);

  // Clear search function that can be called externally
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
  }, []);

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
