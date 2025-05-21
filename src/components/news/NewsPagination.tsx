import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface NewsPaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (newPage: number) => void;
}

export function NewsPagination({ currentPage, totalPages, handlePageChange }: NewsPaginationProps) {
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  // Reset changing state when current page updates
  useEffect(() => {
    setIsChangingPage(false);
  }, [currentPage]);
  
  // Don't render pagination if we only have 0 or 1 pages
  if (totalPages <= 0) {
    return null;
  }
  
  const onPageClick = (page: number) => {
    if (page !== currentPage && !isChangingPage) {
      setIsChangingPage(true);
      handlePageChange(page);
    }
  };

  // Helper function to generate page numbers with ellipsis
  const getPageNumbers = () => {
    // If we have 7 or fewer pages, show all pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Otherwise, show current page with neighbors and ellipsis
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Add ellipsis if current page is more than 3
    if (currentPage > 3) {
      pages.push(-1); // Use -1 as a marker for ellipsis
    }
    
    // Add neighbor pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if current page is less than totalPages - 2
    if (currentPage < totalPages - 2) {
      pages.push(-2); // Use -2 as a marker for second ellipsis
    }
    
    // Always show last page if we have more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Get page numbers with potential ellipsis
  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageClick(currentPage - 1)}
        disabled={currentPage === 1 || isChangingPage}
        className="flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Poprzednia</span>
      </Button>
      
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, idx) => {
          if (page === -1 || page === -2) {
            // Render ellipsis
            return (
              <span 
                key={`ellipsis-${idx}`} 
                className="w-8 text-center"
              >
                …
              </span>
            );
          }
          
          return (
            <Button
              key={`page-${page}`}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageClick(page)}
              disabled={isChangingPage && page !== currentPage}
              className={`h-8 w-8 p-0 ${page === currentPage ? "pointer-events-none" : ""}`}
            >
              {page}
            </Button>
          );
        })}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageClick(currentPage + 1)}
        disabled={currentPage === totalPages || isChangingPage}
        className="flex items-center"
      >
        <span className="hidden sm:inline">Następna</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
