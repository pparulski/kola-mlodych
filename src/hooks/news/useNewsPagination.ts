
import { useState, useEffect, useCallback } from "react";

// Hook for news pagination
export const useNewsPagination = (totalItems: number, itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Reset to page 1 when total items changes
  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  const getPaginationIndices = () => {
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    return { from, to };
  };

  return {
    currentPage,
    totalPages,
    handlePageChange,
    getPaginationIndices
  };
};
