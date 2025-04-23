
import { Category } from "@/types/categories";
import { SelectedCategories } from "./SelectedCategories";

interface CategorySectionProps {
  isHomePage: boolean;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  categories?: Category[];
}

export const CategorySection = ({
  isHomePage,
  selectedCategories = [], // Default to empty array
  setSelectedCategories,
  categories = [] // Default to empty array
}: CategorySectionProps) => {
  if (!isHomePage) {
    return null;
  }

  // Ensure we have arrays, not undefined
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];

  return (
    <div className="mt-2">
      <SelectedCategories 
        selectedCategories={safeSelectedCategories} 
        setSelectedCategories={setSelectedCategories}
        categories={safeCategories}
      />
    </div>
  );
};
