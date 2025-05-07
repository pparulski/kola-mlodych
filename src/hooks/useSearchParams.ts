
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
    }
    // We ONLY want this to run when the location.search string changes externally
    // or when we land on the home page.
  }, [location.search, isHomePage]);

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
  }, [searchQuery, selectedCategories, isHomePage, location.pathname, navigate]);

  // --- Effect 3: Clear search state when navigating AWAY from home page ---
  useEffect(() => {
    if (!isHomePage && searchQuery !== "") {
      console.log("useSearchParams: Navigated away from home page, clearing search query state.");
      setSearchQuery("");
    }
  }, [isHomePage, searchQuery]);

  // Return the state and setters
  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    isHomePage
  };
}
