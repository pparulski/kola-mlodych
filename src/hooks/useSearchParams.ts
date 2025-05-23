
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";
import { debounce } from "@/utils/debounce";

export function useSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useRouterSearchParams();
  
  // Track initialization and state sync
  const isInitialized = useRef(false);
  const isUpdatingURL = useRef(false);
  const hasLoadedFromURL = useRef(false);
  const ignoreNextURLUpdate = useRef(false);
  
  // Parse URL params once on mount
  const urlSearch = searchParams.get('search') || '';
  const urlCategories = (searchParams.get('categories') || '').split(',').filter(Boolean);
  
  // Initialize state from URL, only once on mount
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(urlCategories);
  
  // Additional state
  const isHomePage = location.pathname === '/';
  
  // Effect to initialize state from URL parameters only once
  useEffect(() => {
    if (!hasLoadedFromURL.current) {
      console.log("Initial URL parameters loaded:", { 
        urlSearch, 
        urlCategories 
      });
      
      // Only load from URL params on first render if there's something to load
      if (urlSearch) setSearchQuery(urlSearch);
      if (urlCategories.length > 0) setSelectedCategories(urlCategories);
      
      hasLoadedFromURL.current = true;
      isInitialized.current = true;
    }
  }, [urlSearch, urlCategories]);

  // Effect to sync URL parameters to state (URL → state)
  useEffect(() => {
    // Skip on initial load
    if (!isInitialized.current) return;
    
    // Skip if we're currently updating URL from state changes
    if (isUpdatingURL.current) return;
    
    // Skip if we've explicitly marked to ignore the next update
    if (ignoreNextURLUpdate.current) {
      ignoreNextURLUpdate.current = false;
      return;
    }
    
    // Only process URL updates when on the homepage
    if (!isHomePage) return;
    
    const params = new URLSearchParams(location.search);
    const newSearchQuery = params.get('search') || '';
    const newCategories = (params.get('categories') || '').split(',').filter(Boolean);
    
    // Only update if different to prevent loops
    const searchChanged = newSearchQuery !== searchQuery;
    const categoriesChanged = JSON.stringify(newCategories) !== JSON.stringify(selectedCategories);
    
    if (searchChanged || categoriesChanged) {
      console.log("URL changed, updating state:", { 
        newSearchQuery, 
        newCategories,
        currentSearch: searchQuery,
        currentCategories: selectedCategories
      });
      
      // Update state without triggering the state→URL effect
      if (searchChanged) {
        setSearchQuery(newSearchQuery);
      }
      
      if (categoriesChanged) {
        setSelectedCategories(newCategories);
      }
    }
  }, [location.search, isHomePage, searchQuery, selectedCategories]);

  // Debounced function to update URL from state changes (state → URL)
  const updateURL = useCallback(
    debounce((query: string, categories: string[]) => {
      // Don't update URL if not on homepage or not initialized
      if (!isHomePage || !isInitialized.current) return;
      
      console.log("State changed, updating URL:", { 
        query, 
        categories,
        currentSearch: location.search
      });
      
      // Mark that we're updating URL to prevent loops
      isUpdatingURL.current = true;
      
      const params = new URLSearchParams();
      
      // Only add parameters if they have values
      if (query) params.set('search', query);
      if (categories.length > 0) params.set('categories', categories.join(','));
      
      const newQueryString = params.toString();
      const currentQueryString = location.search.substring(1); // Remove leading ?
      
      // Only navigate if the parameters actually changed
      if (newQueryString !== currentQueryString) {
        console.log(`Updating URL from "${currentQueryString}" to "${newQueryString}"`);
        
        navigate(`${location.pathname}${newQueryString ? `?${newQueryString}` : ''}`, { 
          replace: true // Replace to avoid stacking history entries
        });
      }
      
      // Reset flag after a delay to allow for state updates
      setTimeout(() => {
        isUpdatingURL.current = false;
      }, 200);
    }, 400), // Use a longer debounce time
    [location.pathname, location.search, navigate, isHomePage]
  );

  // Effect to update URL when state changes
  useEffect(() => {
    if (isInitialized.current && !isUpdatingURL.current && isHomePage) {
      updateURL(searchQuery, selectedCategories);
    }
  }, [searchQuery, selectedCategories, updateURL, isHomePage]);

  // Function to clear all filters
  const clearFilters = useCallback(() => {
    if (isUpdatingURL.current) return;
    
    console.log("Clearing all filters");
    
    // Set ignoreNextURLUpdate to prevent the URL update from triggering a state update
    ignoreNextURLUpdate.current = true;
    
    // Update our state
    setSearchQuery("");
    setSelectedCategories([]);
    
    if (isHomePage) {
      // Clear URL params
      isUpdatingURL.current = true;
      
      // Go to the current pathname without query params
      navigate(location.pathname, { replace: true });
      
      // Reset after a delay
      setTimeout(() => {
        isUpdatingURL.current = false;
      }, 200);
    }
  }, [isHomePage, navigate, location.pathname]);

  // Return the state, setters, and utilities
  return {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    isHomePage,
    clearFilters
  };
}
