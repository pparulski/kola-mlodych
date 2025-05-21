
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

// Hook for news pagination
export const useNewsPagination = (totalItems: number, itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  
  // Calculate total pages ensuring at least 1 page
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Reset to page 1 when location changes (navigation between routes)
  useEffect(() => {
    console.log(`Route changed to ${location.pathname}, resetting page to 1`);
    setCurrentPage(1);
  }, [location.pathname]);
  
  // Reset to page 1 when total items changes
  useEffect(() => {
    // Only reset if we have a valid total and we're on a page that would be out of bounds
    if (totalItems >= 0 && (currentPage > Math.max(1, Math.ceil(totalItems / itemsPerPage)) || currentPage < 1)) {
      console.log(`Resetting page to 1 (was ${currentPage}) because totalItems changed to ${totalItems}`);
      setCurrentPage(1);
    }
  }, [totalItems, itemsPerPage, currentPage]);

  // Reset to page 1 on page reload
  useEffect(() => {
    const handlePageReload = () => {
      if (currentPage !== 1) {
        console.log("Page reloaded, resetting to page 1");
        setCurrentPage(1);
      }
    };

    // Check for page reload
    if (performance.navigation && performance.navigation.type === 1) {
      handlePageReload();
    }

    // Add event listener for visibility changes (another way to detect reloads)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handlePageReload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentPage]);

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
