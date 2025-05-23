// src/hooks/useSearchParams.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";
import { debounce } from "@/utils/debounce";

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const [actualSearchParams] = useRouterSearchParams();

  const isMounted = useRef(false);

  // Initialize state from URL ONLY ONCE
  const [searchQuery, setSearchQueryState] = useState(() => actualSearchParams.get('search') || '');
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(() =>
    (actualSearchParams.get('categories') || '').split(',').filter(Boolean)
  );

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isMounted.current) {
      console.log("useSearchParams: Initialized from URL.", {
        initialSearch: searchQuery,
        initialCategories: selectedCategories,
      });
      isMounted.current = true;
    }
  }, [searchQuery, selectedCategories]); // Log initial state


  // Debounced function to update URL from state (State -> URL)
  const updateURL = useCallback(
    debounce((currentQuery: string, currentCategories: string[]) => {
      if (!isHomePage || !isMounted.current) return;

      const params = new URLSearchParams();
      if (currentQuery) params.set('search', currentQuery);
      if (currentCategories.length > 0) params.set('categories', currentCategories.join(','));
      
      const newQueryString = params.toString();
      const currentPathWithQuery = `${location.pathname}${newQueryString ? `?${newQueryString}` : ''}`;
      const currentFullURL = `${location.pathname}${location.search}`;

      if (currentPathWithQuery !== currentFullURL) {
        console.log(`useSearchParams (State -> URL): Navigating. New query string: "?${newQueryString}"`);
        navigate(currentPathWithQuery, { replace: true });
      }
    }, 300),
    [navigate, isHomePage, location.pathname] // Removed location.search
  );

  // Effect to trigger URL update when local state changes
  useEffect(() => {
    if (isMounted.current && isHomePage) {
      // console.log("useSearchParams (State -> URL): State changed, queueing URL update", { searchQuery, selectedCategories });
      updateURL(searchQuery, selectedCategories);
    }
  }, [searchQuery, selectedCategories, updateURL, isHomePage]);


  // Effect to sync URL to State (e.g., for browser back/forward)
  // Let's make this one MUCH simpler for now, or even temporarily disable its write-back
  useEffect(() => {
    if (!isMounted.current || !isHomePage) return;

    // This effect now only logs what it sees from the URL.
    // It WON'T update the state for now to prevent the reset.
    const paramsFromURL = new URLSearchParams(location.search);
    const urlSearch = paramsFromURL.get('search') || '';
    const urlCategories = (paramsFromURL.get('categories') || '').split(',').filter(Boolean);

    console.log("useSearchParams (URL -> State - READ ONLY): Detected URL params:", {
      urlSearch,
      urlCategories,
      currentStateSearch: searchQuery,
      currentStateCategories: selectedCategories,
    });

    // TEMPORARILY DISABLE STATE UPDATE FROM THIS EFFECT
    /*
    const searchNeedsUpdate = urlSearch !== searchQuery;
    const categoriesNeedUpdate = JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories);

    if (searchNeedsUpdate || categoriesNeedUpdate) {
      console.log("useSearchParams (URL -> State): Would update state if enabled:", {
        newUrlSearch: urlSearch,
        newUrlCategories: urlCategories,
      });
      // if (searchNeedsUpdate) setSearchQueryState(urlSearch);
      // if (categoriesNeedUpdate) setSelectedCategoriesState(urlCategories);
    }
    */

  }, [location.search, isHomePage]); // Removed searchQuery, selectedCategories from deps for now during this test
                                     // to make it purely reactive to URL changes


  const setMainSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setMainSelectedCategories = useCallback((categories: string[]) => {
    setSelectedCategoriesState(categories);
  }, []);
  
  const clearFilters = useCallback(() => {
    setSearchQueryState("");
    setSelectedCategoriesState([]);
    // updateURL will handle clearing the URL if on homepage
    // If not on homepage and URL has params, navigate to clean path
    if (!isHomePage && location.search) {
        navigate(location.pathname, {replace: true});
    }
  }, [isHomePage, navigate, location.pathname, location.search]);

  return {
    searchQuery,
    setSearchQuery: setMainSearchQuery,
    selectedCategories,
    setSelectedCategories: setMainSelectedCategories,
    isHomePage,
    clearFilters,
  };
}