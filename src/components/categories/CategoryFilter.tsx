
import * as React from "react";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import { Category } from "@/types/categories";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CategoryFilterProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  availableCategories: Category[];
  position?: "top" | "bottom";
  compactOnMobile?: boolean;
}

export function CategoryFilter({
  selectedCategories = [], // Default to empty array
  setSelectedCategories,
  availableCategories = [], // Default to empty array
  position = "bottom",
  compactOnMobile = false
}: CategoryFilterProps) {
  // Ensure we have arrays, not undefined
  const safeCategories = Array.isArray(availableCategories) ? availableCategories : [];
  const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];

  // Handle removing a single category
  const handleRemoveCategory = (slug: string) => {
    setSelectedCategories(safeSelectedCategories.filter((c) => c !== slug));
  };

  // Get the name of a category by its slug
  const getCategoryName = (slug: string): string => {
    const category = safeCategories.find((c) => c.slug === slug);
    return category ? category.name : slug;
  };

  return (
    <div className={position === "top" ? "" : "mt-6"}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Mobile view - icon only */}
        {compactOnMobile && (
          <CategoryFilterDropdown
            selectedCategories={safeSelectedCategories}
            setSelectedCategories={setSelectedCategories}
            availableCategories={safeCategories}
            compactOnMobile={true}
          />
        )}
        
        {/* Desktop view - full button */}
        {!compactOnMobile && (
          <CategoryFilterDropdown
            selectedCategories={safeSelectedCategories}
            setSelectedCategories={setSelectedCategories}
            availableCategories={safeCategories}
          />
        )}
        
        {/* Show selected categories badges only on desktop or when not compact */}
        {(!compactOnMobile && safeSelectedCategories.length > 0) && (
          safeSelectedCategories.map((slug) => (
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
