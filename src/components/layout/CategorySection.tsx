
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
  selectedCategories,
  setSelectedCategories,
  categories
}: CategorySectionProps) => {
  if (!isHomePage) {
    return null;
  }

  return (
    <div className="mt-2">
      <SelectedCategories 
        selectedCategories={selectedCategories} 
        setSelectedCategories={setSelectedCategories}
        categories={categories}
      />
    </div>
  );
};
