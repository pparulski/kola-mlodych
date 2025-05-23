
import { useState, useCallback } from "react";

// Hook for news pagination calculation only - no URL management
export const useNewsPagination = (
  totalItems: number, 
  itemsPerPage: number,
  initialPage: number = 1,
  onPageChange?: (page: number) => void
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Calculate total pages ensuring at least 1 page
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Reset to page 1 when total items changes and current page would be out of bounds
  if (totalItems >= 0 && currentPage > totalPages && currentPage !== 1) {
    setCurrentPage(1);
  }

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      console.log(`Changing page from ${currentPage} to ${newPage}`);
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, currentPage, onPageChange]);

  // Fixed calculation to ensure correct pagination ranges
  const getPaginationIndices = useCallback(() => {
    // Calculate proper zero-based indices for database queries
    const from = (currentPage - 1) * itemsPerPage;
    // Calculate proper 'to' index that includes the full page
    const to = from + itemsPerPage - 1;
    
    console.log(`Pagination indices: from=${from}, to=${to}, page=${currentPage}/${totalPages}, itemsPerPage=${itemsPerPage}`);
    return { from, to };
  }, [currentPage, totalPages, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    handlePageChange,
    getPaginationIndices
  };
};
