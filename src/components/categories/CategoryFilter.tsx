
import * as React from "react";
import { CategoryFilterDropdown } from "./CategoryFilterDropdown";
import { Category, FilterComponentProps } from "@/types/categories";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function CategoryFilter({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
  position = "bottom"
}: FilterComponentProps) {
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
        <CategoryFilterDropdown
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          availableCategories={availableCategories}
        />
        
        {selectedCategories.map((slug) => (
          <Badge key={slug} variant="secondary" className="flex items-center gap-1 text-sm px-3 py-1.5">
            {getCategoryName(slug)}
            <X 
              className="h-3 w-3 cursor-pointer hover:text-destructive ml-1" 
              onClick={() => handleRemoveCategory(slug)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}
