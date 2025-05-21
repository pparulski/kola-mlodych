
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface NewsPaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (newPage: number) => void;
}

export function NewsPagination({ currentPage, totalPages, handlePageChange }: NewsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }
  
  // Prevent default scroll behavior when clicking pagination buttons
  const handlePageClick = (newPage: number) => {
    handlePageChange(newPage);
  };

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Poprzednia</span>
      </Button>
      
      <div className="flex items-center space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageClick(page)}
            className="h-8 w-8 p-0"
          >
            {page}
          </Button>
        ))}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center"
      >
        <span className="hidden sm:inline">Następna</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
