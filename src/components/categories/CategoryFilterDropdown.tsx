
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
  selectedCategories = [], // Default to empty array
  setSelectedCategories,
  availableCategories = [], // Default to empty array
  compactOnMobile = false
}: CategoryFilterDropdownProps) {
  // Ensure we pass arrays, not undefined
  const safeCategories = Array.isArray(availableCategories) ? availableCategories : [];
  const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];
  
  return (
    <CategoryFilterMultiSelect
      selectedCategories={safeSelectedCategories}
      setSelectedCategories={setSelectedCategories}
      availableCategories={safeCategories}
    />
  );
}
