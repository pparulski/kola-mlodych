
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryFilterButtonProps {
  onClick: () => void;
  className?: string;
}

export function CategoryFilterButton({ onClick, className = "" }: CategoryFilterButtonProps) {
  const isMobile = useIsMobile();
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className={`flex items-center gap-1 h-10 ${className}`}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {!isMobile && <span>Kategorie</span>}
    </Button>
  );
}
