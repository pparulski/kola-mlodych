
import { useState, useEffect, useCallback } from "react";
import { ARTICLES_PER_PAGE } from "./useNewsBase";

// Hook for news pagination
export const useNewsPagination = (totalItems: number, itemsPerPage: number = ARTICLES_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages ensuring at least 1 page
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Reset to page 1 when total items changes
  useEffect(() => {
    // Only reset if we have a valid total and we're on a page that would be out of bounds
    if (totalItems >= 0 && (currentPage > totalPages || currentPage < 1)) {
      console.log(`Resetting page to 1 (was ${currentPage}) because totalItems changed to ${totalItems}, totalPages: ${totalPages}`);
      setCurrentPage(1);
    }
  }, [totalItems, totalPages, currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log(`Changing page from ${currentPage} to ${newPage} (total pages: ${totalPages})`);
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, currentPage]);

  const getPaginationIndices = useCallback(() => {
    // Calculate zero-based indices for database queries
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1; // -1 because range is inclusive
    
    console.log(`Pagination indices: page ${currentPage}, from ${from}, to ${to}`);
    return { from, to };
  }, [currentPage, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    handlePageChange,
    getPaginationIndices,
    itemsPerPage
  };
};
