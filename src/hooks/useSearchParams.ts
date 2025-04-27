import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate(); // Use navigate for URL updates
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // --- State derived from location ---
  const isHomePage = location.pathname === '/';
  const currentParams = new URLSearchParams(location.search);
  const urlSearch = currentParams.get('search') || '';
  const urlCategories = (currentParams.get('categories') || '').split(',').filter(Boolean); // Get array from URL

  // --- Effect 1: Update STATE from URL ---
  // This effect runs when the component mounts or the actual URL search string changes
  // (e.g., browser back/forward, manual URL change).
  // It ensures the component's state reflects the URL's source of truth.
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
    // DO NOT include searchQuery or selectedCategories here.
  }, [location.search, isHomePage]); // Added isHomePage dependency

  // --- Effect 2: Update URL from STATE ---
  // This effect runs when the user *intends* to change the search/categories state
  // (e.g., pressing Enter, clicking clear, selecting a category).
  // It updates the URL to reflect the new desired state, but only on the home page.
  useEffect(() => {
    // Only trigger URL update if on the home page
    if (isHomePage) {
        const params = new URLSearchParams(location.search); // Start with current URL params
        const currentUrlSearch = params.get('search') || '';
        const currentUrlCategories = params.get('categories') || '';
        const newCategoriesString = selectedCategories.join(',');

        let needsUpdate = false;

        // Compare desired state (searchQuery) with current URL state
        if (searchQuery !== currentUrlSearch) {
            if (searchQuery) {
                params.set('search', searchQuery);
            } else {
                params.delete('search');
            }
            needsUpdate = true;
        }

        // Compare desired state (selectedCategories) with current URL state
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
    // This effect should ONLY run when the component's internal state changes
  }, [searchQuery, selectedCategories, isHomePage, location.pathname, navigate]); // Add navigate as dependency

  // --- Effect 3: Clear search state when navigating AWAY from home page ---
  useEffect(() => {
    if (!isHomePage && searchQuery !== "") {
      console.log("useSearchParams: Navigated away from home page, clearing search query state.");
      setSearchQuery(""); // Clear the state directly
      // No need to update URL here, as we are off the home page
    }
  }, [isHomePage, searchQuery]); // location.pathname implicit via isHomePage

  // Return the state and setters
  return {
    searchQuery,
    setSearchQuery, // This setter is called by SearchBar on Enter/Clear
    selectedCategories,
    setSelectedCategories, // This setter is called by CategoryFilter
    isHomePage
  };
}