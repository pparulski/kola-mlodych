
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";
import { debounce } from "@/utils/debounce";

/**
 * A hook that consolidates all URL parameter management (search, categories, page)
 * to prevent conflicts between different components updating the URL
 */
export function useEnhancedSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const [actualSearchParams] = useRouterSearchParams();
  
  // Refs to manage synchronization and prevent loops
  const isInitializing = useRef(true);
  const isUpdatingURLFromState = useRef(false);
  const isHandlingPageChange = useRef(false);

  // Initialize state from URL params ONCE on initial mount
  const [searchQuery, setSearchQueryState] = useState(() => actualSearchParams.get('search') || '');
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(() => 
    (actualSearchParams.get('categories') || '').split(',').filter(Boolean)
  );
  const [currentPage, setCurrentPageState] = useState(() => {
    const pageParam = actualSearchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  
  // Track total items and pages for pagination
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Default, can be overridden
  
  const isHomePage = location.pathname === '/';
  
  // Calculate total pages based on totalItems and itemsPerPage
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Log initial state values on mount only
  useEffect(() => {
    if (isInitializing.current) {
      console.log("useEnhancedSearchParams: Initial state from URL", {
        searchQuery,
        selectedCategories,
        currentPage,
        pathname: location.pathname,
        search: location.search
      });
      isInitializing.current = false;
    }
  }, []); // Empty deps array ensures this runs only once
  
  // Function to update URL from state (debounced to prevent rapid changes)
  const updateURL = useCallback(
    debounce((newSearchQuery: string, newCategories: string[], newPage: number) => {
      // Don't update URL if not on homepage or still initializing
      if (!isHomePage || isInitializing.current) return;

      isUpdatingURLFromState.current = true; // Set flag BEFORE navigation

      const params = new URLSearchParams();
      if (newSearchQuery) params.set('search', newSearchQuery);
      if (newCategories.length > 0) params.set('categories', newCategories.join(','));
      if (newPage > 1) params.set('page', newPage.toString());
      
      const newQueryString = params.toString();
      // current location.search includes '?' if params exist, or is empty
      const existingQueryString = location.search.startsWith('?') 
        ? location.search.substring(1) 
        : location.search;

      if (newQueryString !== existingQueryString) {
        console.log(`useEnhancedSearchParams: (State -> URL) Updating URL from "${existingQueryString}" to "${newQueryString}"`);
        navigate(`${location.pathname}${newQueryString ? `?${newQueryString}` : ''}`, { 
          replace: true 
        });
      }

      // Reset flag after allowing for navigation effects
      setTimeout(() => {
        isUpdatingURLFromState.current = false;
      }, 0);
    }, 300),
    [navigate, isHomePage, location.pathname, location.search]
  );

  // Effect to trigger URL update when local state changes
  useEffect(() => {
    // Skip on initial mount or if not on home page
    if (isInitializing.current || !isHomePage) return;

    // Skip if currently handling a page change event (to prevent double URL updates)
    if (isHandlingPageChange.current) {
      isHandlingPageChange.current = false;
      return;
    }

    // Skip if we are currently updating state from URL changes
    if (isUpdatingURLFromState.current) return;

    // Call the debounced URL update function
    updateURL(searchQuery, selectedCategories, currentPage);
  }, [searchQuery, selectedCategories, currentPage, updateURL, isHomePage]);

  // Effect to sync URL parameters to state, e.g., when browser back/forward is used
  useEffect(() => {
    // Skip on initial mount or if we're currently pushing state to URL
    if (isInitializing.current || isUpdatingURLFromState.current || !isHomePage) {
      return;
    }

    const paramsFromURL = new URLSearchParams(location.search);
    const urlSearch = paramsFromURL.get('search') || '';
    const urlCategories = (paramsFromURL.get('categories') || '').split(',').filter(Boolean);
    const urlPage = parseInt(paramsFromURL.get('page') || '1', 10);

    // Check if any parameter has changed
    const searchChanged = urlSearch !== searchQuery;
    const categoriesChanged = JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories);
    const pageChanged = urlPage !== currentPage;

    if (searchChanged || categoriesChanged || pageChanged) {
      console.log("useEnhancedSearchParams: (URL -> State) URL changed externally, updating state", {
        urlSearch,
        urlCategories,
        urlPage,
        currentStateSearch: searchQuery,
        currentStateCategories: selectedCategories,
        currentStatePage: currentPage
      });
      
      // Apply all changes at once to avoid multiple state updates
      if (searchChanged) {
        setSearchQueryState(urlSearch);
      }
      if (categoriesChanged) {
        setSelectedCategoriesState(urlCategories);
      }
      if (pageChanged) {
        setCurrentPageState(urlPage);
      }
    }
  }, [location.search, isHomePage, searchQuery, selectedCategories, currentPage]);

  // Wrapped setters for search query and categories
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    // Reset page to 1 when search query changes
    if (currentPage !== 1) {
      setCurrentPageState(1);
    }
  }, [currentPage]);

  const setSelectedCategories = useCallback((categories: string[]) => {
    setSelectedCategoriesState(categories);
    // Reset page to 1 when categories change
    if (currentPage !== 1) {
      setCurrentPageState(1);
    }
  }, [currentPage]);

  // Handle page changes with validation
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log(`useEnhancedSearchParams: Changing page from ${currentPage} to ${newPage}`);
      isHandlingPageChange.current = true; // Set flag to prevent double URL updates
      setCurrentPageState(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, currentPage]);

  // Calculate proper pagination indices for database queries
  const getPaginationIndices = useCallback(() => {
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    console.log(`Pagination indices: from=${from}, to=${to}, page=${currentPage}/${totalPages}, itemsPerPage=${itemsPerPage}`);
    return { from, to };
  }, [currentPage, itemsPerPage, totalPages]);

  // Clear all filters and reset page
  const clearFilters = useCallback(() => {
    console.log("useEnhancedSearchParams: Clearing filters");
    isUpdatingURLFromState.current = true; // Prevent URL -> State sync during this manual clear
    
    setSearchQueryState("");
    setSelectedCategoriesState([]);
    setCurrentPageState(1);
    
    if (isHomePage) {
      navigate(location.pathname, { replace: true }); // Navigate to base path without params
    }
    
    setTimeout(() => {
      isUpdatingURLFromState.current = false;
    }, 0);
  }, [isHomePage, navigate, location.pathname]);

  // Update itemsPerPage and recalculate totalPages
  const setNewsPerPage = useCallback((count: number) => {
    setItemsPerPage(count);
  }, []);

  // Update totalItems for pagination
  const updateTotalItems = useCallback((count: number) => {
    setTotalItems(count);
    
    // Reset page to 1 if current page would be out of bounds with new total
    const maxPage = Math.max(1, Math.ceil(count / itemsPerPage));
    if (currentPage > maxPage) {
      console.log(`Resetting page to 1 (was ${currentPage}) because totalItems changed to ${count}`);
      setCurrentPageState(1);
    }
  }, [currentPage, itemsPerPage]);

  return {
    // Basic search params
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    // Pagination
    currentPage,
    totalPages,
    handlePageChange,
    getPaginationIndices,
    totalItems,
    updateTotalItems,
    itemsPerPage,
    setNewsPerPage,
    // Utility
    isHomePage,
    clearFilters,
  };
}
