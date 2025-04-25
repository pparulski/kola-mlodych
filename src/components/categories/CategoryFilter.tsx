
import * as React from "react";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import { Category, FilterComponentProps } from "@/types/categories";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function CategoryFilter({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
  position = "bottom",
  compactOnMobile = false
}: FilterComponentProps & { compactOnMobile?: boolean }) {
  const { toast } = useToast();

  // Add a simple function to help debug selected categories
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
            className="text-xs"
          >
            Wyczyść filtry
          </Button>
        )}
      </div>
    </div>
  );
}
