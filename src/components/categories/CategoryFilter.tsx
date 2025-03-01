
import * as React from "react";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import { Category, FilterComponentProps } from "@/types/categories";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoryFilter({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
  position = "bottom",
  compactOnMobile = false
}: FilterComponentProps & { compactOnMobile?: boolean }) {
  // Handle removing a single category
  const handleRemoveCategory = (slug: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== slug));
  };

  // Get the name of a category by its slug
  const getCategoryName = (slug: string): string => {
    const category = availableCategories.find((c) => c.slug === slug);
    return category ? category.name : slug;
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
        
        {/* Show selected categories badges only on desktop or when not compact */}
        {(!compactOnMobile && selectedCategories.length > 0) && (
          selectedCategories.map((slug) => (
            <Badge key={slug} variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1.5">
              {getCategoryName(slug)}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive ml-1" 
                onClick={() => handleRemoveCategory(slug)}
              />
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
