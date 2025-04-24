
import * as React from "react";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import { Category, FilterComponentProps } from "@/types/categories";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategoryFilter({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
  position = "bottom",
  compactOnMobile = false
}: FilterComponentProps & { compactOnMobile?: boolean }) {
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
      </div>
    </div>
  );
}
