
import { useState, useEffect, useCallback } from "react";

// Hook for news pagination
export const useNewsPagination = (totalItems: number, itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages ensuring at least 1 page
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Reset to page 1 when total items changes
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

  const getPaginationIndices = () => {
    const from = (currentPage - 1) * itemsPerPage;
    const to = Math.min(from + itemsPerPage - 1, Math.max(0, totalItems - 1));
    return { from, to };
  };

  return {
    currentPage,
    totalPages,
    handlePageChange,
    getPaginationIndices
  };
};
