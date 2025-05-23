
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";
import { debounce } from "@/utils/debounce";

export function useEnhancedSearchParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useRouterSearchParams(); // Get but don't set directly

  // Refs to manage synchronization and prevent loops
  const isInitializing = useRef(true);
  const isUpdatingURLFromState = useRef(false);

  // Parse all URL parameters on initial mount
  const [searchQuery, setSearchQueryState] = useState(() => searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(() => 
    (searchParams.get('categories') || '').split(',').filter(Boolean)
  );
  const [currentPage, setCurrentPageState] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

  const isHomePage = location.pathname === '/';
  const previousPathname = useRef(location.pathname);

  // Log initial state values on mount only
  useEffect(() => {
    if (isInitializing.current) {
      console.log("useEnhancedSearchParams: Initial state from URL", {
        searchQuery,
        selectedCategories,
        currentPage,
        pathname: location.pathname,
      });
      isInitializing.current = false;
    }
  }, [searchQuery, selectedCategories, currentPage, location.pathname]);

  // Calculate total pages - will be set by consumer components
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Debounced function to update URL from state (state -> URL)
  const updateURL = useCallback(
    debounce((current: { query: string, categories: string[], page: number }) => {
      if (!isHomePage) return; // Don't update URL if not on homepage

      isUpdatingURLFromState.current = true; // Flag to prevent loops

      const params = new URLSearchParams();
      
      // Add search parameter if it exists
      if (current.query) params.set('search', current.query);
      
      // Add categories parameter if there are any
      if (current.categories.length > 0) params.set('categories', current.categories.join(','));
      
      // Add page parameter if it's not page 1
      if (current.page > 1) params.set('page', current.page.toString());
      
      const newQueryString = params.toString();
      const existingQueryString = location.search.startsWith('?') 
        ? location.search.substring(1) 
        : location.search;

      if (newQueryString !== existingQueryString) {
        console.log(`useEnhancedSearchParams: (State -> URL) Updating URL from "${existingQueryString}" to "${newQueryString}"`);
        navigate(`${location.pathname}${newQueryString ? `?${newQueryString}` : ''}`, { 
          replace: true 
        });
      }

      // Reset flag to allow URL -> state sync after short delay
      setTimeout(() => {
        isUpdatingURLFromState.current = false;
      }, 50); // Small timeout to push to next event loop tick
    }, 300),
    [navigate, isHomePage, location.pathname, location.search]
  );

  // Effect to trigger URL update when local state changes
  useEffect(() => {
    if (isInitializing.current || !isHomePage) return;

    updateURL({ 
      query: searchQuery, 
      categories: selectedCategories, 
      page: currentPage 
    });
  }, [searchQuery, selectedCategories, currentPage, updateURL, isHomePage]);

  // Effect to sync URL parameters to state (URL -> state)
  useEffect(() => {
    // Skip on initial mount or when we're updating the URL
    if (isInitializing.current || isUpdatingURLFromState.current) {
      return;
    }

    // Only handle URL -> state sync on home page
    if (isHomePage) {
      const paramsFromURL = new URLSearchParams(location.search);
      
      const urlSearch = paramsFromURL.get('search') || '';
      const urlCategories = (paramsFromURL.get('categories') || '').split(',').filter(Boolean);
      const urlPage = paramsFromURL.has('page') 
        ? parseInt(paramsFromURL.get('page') || '1', 10)
        : 1;

      const searchNeedsUpdate = urlSearch !== searchQuery;
      const categoriesNeedUpdate = JSON.stringify(urlCategories) !== JSON.stringify(selectedCategories);
      const pageNeedsUpdate = urlPage !== currentPage;

      if (searchNeedsUpdate || categoriesNeedUpdate || pageNeedsUpdate) {
        console.log("useEnhancedSearchParams: (URL -> State) URL changed externally, updating state", {
          urlSearch,
          urlCategories,
          urlPage,
          currentStateSearch: searchQuery,
          currentStateCategories: selectedCategories,
          currentStatePage: currentPage
        });
        
        if (searchNeedsUpdate) setSearchQueryState(urlSearch);
        if (categoriesNeedUpdate) setSelectedCategoriesState(urlCategories);
        if (pageNeedsUpdate) setCurrentPageState(urlPage);
      }
    }
  }, [location.search, isHomePage, searchQuery, selectedCategories, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (!isInitializing.current && currentPage !== 1 && (searchQuery || selectedCategories.length > 0)) {
      console.log("useEnhancedSearchParams: Filters changed, resetting page to 1");
      setCurrentPageState(1);
    }
  }, [searchQuery, selectedCategories, currentPage]);

  // Reset when changing routes
  useEffect(() => {
    if (location.pathname !== previousPathname.current) {
      console.log(`useEnhancedSearchParams: Route changed from ${previousPathname.current} to ${location.pathname}`);
      
      // Clear filters only when navigating away from home
      const isFromHomepage = previousPathname.current === '/';
      const isToHomepage = location.pathname === '/';
      const isFromCategoryPage = previousPathname.current.startsWith('/category/');
      const isToCategoryPage = location.pathname.startsWith('/category/');
      
      if ((isFromHomepage && !isToCategoryPage && !isToHomepage) || 
          (isFromCategoryPage && !isToCategoryPage && !isToHomepage)) {
        console.log(`Navigation: clearing filters`);
        clearFilters();
      }
      
      previousPathname.current = location.pathname;
    }
  }, [location.pathname]);

  // Wrapped setters for state
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  const setSelectedCategories = useCallback((categories: string[]) => {
    setSelectedCategoriesState(categories);
  }, []);
  
  const setCurrentPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      console.log(`useEnhancedSearchParams: Changing page from ${currentPage} to ${page}`);
      setCurrentPageState(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  const clearFilters = useCallback(() => {
    console.log("useEnhancedSearchParams: Clearing all filters and pagination");
    isUpdatingURLFromState.current = true;
    setSearchQueryState("");
    setSelectedCategoriesState([]);
    setCurrentPageState(1);
    if (isHomePage) {
      navigate(location.pathname, { replace: true });
    }
    setTimeout(() => {
      isUpdatingURLFromState.current = false;
    }, 50);
  }, [isHomePage, navigate, location.pathname]);

  // Calculate pagination indices for database queries
  const getPaginationIndices = useCallback(() => {
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    
    console.log(`Pagination indices: from=${from}, to=${to}, page=${currentPage}/${totalPages}, itemsPerPage=${itemsPerPage}`);
    return { from, to };
  }, [currentPage, totalPages, itemsPerPage]);

  // Allow component to set total items for accurate pagination
  const setTotal = useCallback((total: number, perPage?: number) => {
    setTotalItems(total);
    if (perPage) setItemsPerPage(perPage);
    
    // Reset current page if it becomes out of bounds
    const newTotalPages = Math.max(1, Math.ceil(total / (perPage || itemsPerPage)));
    if (currentPage > newTotalPages) {
      console.log(`Resetting page to 1 (was ${currentPage}) because totalItems changed to ${total}, max page is now ${newTotalPages}`);
      setCurrentPageState(1);
    }
  }, [currentPage, itemsPerPage]);

  return {
    // URL state
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories, 
    currentPage,
    setCurrentPage,
    
    // Pagination helpers
    totalItems,
    totalPages,
    setTotal,
    getPaginationIndices,
    
    // Helper flags and functions
    isHomePage,
    clearFilters
  };
}
