
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface NewsPaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (newPage: number) => void;
}

export function NewsPagination({ currentPage, totalPages, handlePageChange }: NewsPaginationProps) {
  // Log when pagination renders to help with debugging
  useEffect(() => {
    console.log(`NewsPagination rendered: currentPage=${currentPage}, totalPages=${totalPages}`);
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  // Helper to determine how many page numbers to show
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Handle larger page counts with ellipsis
    if (currentPage <= 3) {
      // Near the start
      return [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      // Somewhere in the middle
      return [
        1, 
        '...', 
        currentPage - 1, 
        currentPage, 
        currentPage + 1, 
        '...', 
        totalPages
      ];
    }
  };

  const onPageClick = (page: number | string) => {
    if (typeof page === 'number') {
      console.log(`Page button clicked: ${page}`);
      handlePageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Poprzednia</span>
      </Button>
      
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <div key={`ellipsis-${index}`} className="px-2">...</div>
          ) : (
            <Button
              key={`page-${page}`}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageClick(page as number)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center"
      >
        <span className="hidden sm:inline">Następna</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
