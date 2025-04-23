
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
  // Ensure we pass arrays, not undefined
  const safeCategories = availableCategories || [];
  const safeSelectedCategories = selectedCategories || [];
  
  return (
    <CategoryFilterMultiSelect
      selectedCategories={safeSelectedCategories}
      setSelectedCategories={setSelectedCategories}
      availableCategories={safeCategories}
    />
  );
}
