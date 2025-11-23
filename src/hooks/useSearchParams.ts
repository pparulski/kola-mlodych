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
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(() => {
    const fromSearch = actualSearchParams.get('search') || '';
    if (fromSearch) return []; // Exclusivity: if search is set in URL, ignore categories on init
    return (actualSearchParams.get('categories') || '').split(',').filter(Boolean);
  });

  const isHomePage = location.pathname === '/';
  // Track last location change to introduce a quiet period for URL writes
  const lastLocationChangeRef = useRef<number>(Date.now());

  useEffect(() => {
    lastLocationChangeRef.current = Date.now();
  }, [location.pathname, location.search]);

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

      // Quiet period after route/search changes to avoid racing with POP/back and pagination URL sync
      const now = Date.now();
      const sinceNav = now - lastLocationChangeRef.current;
      if (sinceNav < 500) {
        console.log(`useSearchParams (State -> URL): Quiet period active (${sinceNav}ms since nav), skipping write`);
        return;
      }

      // Start from current search params to preserve unrelated keys like "page"
      const params = new URLSearchParams(location.search);

      // Exclusivity: if search is provided, clear categories; if categories provided, clear search
      const queryTrimmed = currentQuery.trim();
      const hasSearch = queryTrimmed.length > 0;
      const hasCategories = currentCategories.length > 0;

      if (hasSearch) {
        params.set('search', queryTrimmed);
        params.delete('categories');
        // Reset page when changing search
        params.delete('page');
      } else if (hasCategories) {
        params.set('categories', currentCategories.join(','));
        params.delete('search');
        // Reset page when changing categories
        params.delete('page');
      } else {
        params.delete('search');
        params.delete('categories');
        // Keep page as-is when clearing filters
      }
      
      const newQueryString = params.toString();
      const currentPathWithQuery = `${location.pathname}${newQueryString ? `?${newQueryString}` : ''}`;
      const currentFullURL = `${location.pathname}${location.search}`;

      if (currentPathWithQuery !== currentFullURL) {
        console.log(`useSearchParams (State -> URL): Navigating. New query string: "?${newQueryString}"`);
        navigate(currentPathWithQuery, { replace: true });
      }
    }, 300),
    [navigate, isHomePage, location.pathname, location.search]
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
    // Exclusivity: setting search clears categories and resets page in URL writer
    setSelectedCategoriesState([]);
    setSearchQueryState(query);
  }, []);

  const setMainSelectedCategories = useCallback((categories: string[]) => {
    // Exclusivity: selecting categories clears search and resets page in URL writer
    setSearchQueryState("");
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