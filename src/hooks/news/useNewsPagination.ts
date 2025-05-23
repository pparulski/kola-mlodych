
import { useCallback } from "react";

/**
 * A pure utility hook for pagination logic without URL management
 * All URL management is now handled by useEnhancedSearchParams
 */
export const useNewsPagination = (
  currentPage: number,
  totalItems: number,
  itemsPerPage: number,
  handlePageChange: (newPage: number) => void
) => {
  // Calculate total pages ensuring at least 1 page
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Get pagination indices for database queries
  const getPaginationIndices = useCallback(() => {
    // Calculate proper zero-based indices for database queries
    const from = (currentPage - 1) * itemsPerPage;
    // Calculate proper 'to' index that includes the full page
    const to = from + itemsPerPage - 1;
    
    console.log(`Pagination indices: from=${from}, to=${to}, page=${currentPage}/${totalPages}, itemsPerPage=${itemsPerPage}`);
    return { from, to };
  }, [currentPage, itemsPerPage, totalPages]);

  return {
    totalPages,
    getPaginationIndices
  };
};
