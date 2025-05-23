
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

// Hook for news pagination
export const useNewsPagination = (totalItems: number, itemsPerPage: number) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  // Store previous pathname to detect true navigation (not just search param changes)
  const previousPathname = useRef(location.pathname);
  
  // Initialize from URL param or default to 1
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Calculate total pages ensuring at least 1 page
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Update URL when page changes
  useEffect(() => {
    // Only update if valid page
    if (currentPage >= 1 && currentPage <= totalPages) {
      // Don't trigger for initial state or invalid pages
      const newSearchParams = new URLSearchParams(searchParams);
      if (currentPage === 1) {
        // Remove page param if it's page 1 (cleaner URLs)
        newSearchParams.delete("page");
      } else {
        newSearchParams.set("page", currentPage.toString());
      }
      
      // Only update URL if needed to avoid loops
      const currentPageParam = searchParams.get("page") || "1";
      if (currentPageParam !== currentPage.toString() && (currentPage !== 1 || currentPageParam !== "1")) {
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [currentPage, totalPages, searchParams, setSearchParams]);
  
  // Reset to page 1 ONLY when actual navigation between different routes occurs
  // Not when search params or filter params change
  useEffect(() => {
    if (location.pathname !== previousPathname.current) {
      console.log(`Route changed from ${previousPathname.current} to ${location.pathname}, resetting page to 1`);
      setCurrentPage(1);
      previousPathname.current = location.pathname;
    }
  }, [location.pathname]);
  
  // Reset to page 1 when total items changes and current page would be out of bounds
  useEffect(() => {
    // Only reset if we have a valid total and we're on a page that would be out of bounds
    if (totalItems >= 0 && (currentPage > Math.max(1, Math.ceil(totalItems / itemsPerPage)) || currentPage < 1)) {
      console.log(`Resetting page to 1 (was ${currentPage}) because totalItems changed to ${totalItems}`);
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
    getPaginationIndices
  };
};
