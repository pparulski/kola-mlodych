
import * as React from "react";
import { CategoryFilterMultiSelect } from "./CategoryFilterMultiSelect";
import { Category } from "@/types/categories";

interface CategoryFilterDropdownProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  availableCategories: Category[];
  compactOnMobile?: boolean;
}

export function CategoryFilterDropdown({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
  compactOnMobile = false
}: CategoryFilterDropdownProps) {
  return (
    <CategoryFilterMultiSelect
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      availableCategories={availableCategories || []}
    />
  );
}
