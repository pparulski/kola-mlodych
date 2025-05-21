
import { useState, useEffect, useCallback } from "react";

// Enhanced hook for news pagination with better state management
export const useNewsPagination = (totalItems: number, itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Reset to page 1 when total items changes
  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log(`Page changed from ${currentPage} to ${newPage}`);
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  // Calculate pagination indices for data fetching
  // This now returns the correct 0-based indices for database queries
  const getPaginationIndices = useCallback(() => {
    const from = (currentPage - 1) * itemsPerPage;
    const to = Math.min(from + itemsPerPage - 1, totalItems - 1);
    console.log(`Pagination indices: from=${from}, to=${to}, currentPage=${currentPage}`);
    return { from, to };
  }, [currentPage, itemsPerPage, totalItems]);

  return {
    currentPage,
    totalPages,
    handlePageChange,
    getPaginationIndices
  };
};
