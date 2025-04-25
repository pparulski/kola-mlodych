
import * as React from "react";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import { Category, FilterComponentProps } from "@/types/categories";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export function CategoryFilter({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
  position = "bottom",
  compactOnMobile = false
}: FilterComponentProps & { compactOnMobile?: boolean }) {
  const { toast } = useToast();

  // Handle clearing filters
  const handleClearFilter = () => {
    if (selectedCategories.length > 0) {
      setSelectedCategories([]);
      toast({
        title: "Filtry wyczyszczone",
        description: "Wszystkie filtry kategorii zostały usunięte.",
        duration: 2000,
      });
    }
  };

  return (
    <div className={position === "top" ? "" : "mt-6"}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Mobile view - icon only */}
        {compactOnMobile && (
          <CategoryFilterDropdown
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            availableCategories={availableCategories}
            compactOnMobile={true}
          />
        )}
        
        {/* Desktop view - full button */}
        {!compactOnMobile && (
          <CategoryFilterDropdown
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            availableCategories={availableCategories}
          />
        )}

        {selectedCategories.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilter}
            className="text-xs gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Wyczyść filtry
          </Button>
        )}
      </div>
    </div>
  );
}
