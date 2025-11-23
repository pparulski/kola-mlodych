
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

// Hook for news pagination
export const useNewsPagination = (totalItems: number, itemsPerPage: number) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Store previous pathname to detect true navigation (not just search param changes)
  const previousPathname = useRef(location.pathname);
  const previousSearch = useRef(location.search);
  
  // Initialize from URL param or default to 1
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Calculate total pages ensuring at least 1 page
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Update URL when page changes (but avoid doing this while totalItems is unknown/0 or when hydrating)
  useEffect(() => {
    if (totalItems === 0) return; // Skip URL updates until we know the total
    if (isHydratingFromURL.current) return; // Avoid ping-pong during hydration from URL

    // Only update if valid page
    if (currentPage >= 1 && currentPage <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams);
      if (currentPage === 1) {
        newSearchParams.delete("page");
      } else {
        newSearchParams.set("page", currentPage.toString());
      }
      
      // Only update URL if needed to avoid loops
      const currentPageParam = searchParams.get("page") || "1";
      if (currentPageParam !== currentPage.toString() && (currentPage !== 1 || currentPageParam !== "1")) {
        console.log(`Updating URL page param from ${currentPageParam} to ${currentPage}`);
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [currentPage, totalPages, searchParams, setSearchParams, totalItems]);
  
  // Suppress URL writes during initial hydration from URL to state
  const isHydratingFromURL = useRef(true);
  const [hydrationReady, setHydrationReady] = useState(false);

  // Ensure hydration completes even on initial mount when pathname/search haven't changed
  useEffect(() => {
    // Allow other effects (like CategoryFeed) to mount first
    const t = setTimeout(() => {
      if (isHydratingFromURL.current) {
        const pageParam = parseInt(new URLSearchParams(location.search).get("page") || "1", 10);
        setCurrentPage(isNaN(pageParam) ? 1 : pageParam);
        isHydratingFromURL.current = false;
        setHydrationReady(true);
        console.log(`useNewsPagination: initial hydration complete, currentPage from URL: ${isNaN(pageParam) ? 1 : pageParam}`);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [location.search]);

  // Sync currentPage with URL when route changes or when back/forward updates search params
  useEffect(() => {
    const pathChanged = location.pathname !== previousPathname.current;
    const searchChanged = location.search !== previousSearch.current;

    if (pathChanged || searchChanged) {
      const pageParam = parseInt(new URLSearchParams(location.search).get("page") || "1", 10);
      console.log(`Route/search changed to ${location.pathname}${location.search}, syncing page from URL: ${pageParam}`);
      isHydratingFromURL.current = true;
      setCurrentPage(isNaN(pageParam) ? 1 : pageParam);
      previousPathname.current = location.pathname;
      previousSearch.current = location.search;
      // Stop hydration flag after a short delay to allow all listeners to settle
      setTimeout(() => { 
        isHydratingFromURL.current = false; 
        setHydrationReady(true);
        console.log('useNewsPagination: hydration complete');
      }, 0);
    }
  }, [location.pathname, location.search]);
  
  // Reset to page 1 when total items changes and current page would be out of bounds
  useEffect(() => {
    // Ignore resets when totalItems is unknown or 0 to avoid clobbering back navigation
    if (totalItems <= 0) return;

    const maxPage = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (currentPage > maxPage) {
      console.log(`Resetting page to 1 (was ${currentPage}) because totalItems changed to ${totalItems}, max page is now ${maxPage}`);
      setCurrentPage(1);
    }
  }, [totalItems, itemsPerPage, currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log(`Changing page from ${currentPage} to ${newPage}`);
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, currentPage]);

  // Fixed calculation to ensure correct pagination ranges
  const getPaginationIndices = () => {
    // Calculate proper zero-based indices for database queries
    const from = (currentPage - 1) * itemsPerPage;
    // Calculate proper 'to' index that includes the full page
    const to = from + itemsPerPage - 1;
    
    console.log(`Pagination indices: from=${from}, to=${to}, page=${currentPage}/${totalPages}, itemsPerPage=${itemsPerPage}`);
    return { from, to };
  };

  return {
    currentPage,
    totalPages,
    handlePageChange,
    getPaginationIndices,
    hydrationReady
  };
};
