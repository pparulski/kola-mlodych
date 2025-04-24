
import { Category } from "@/types/categories";

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
  // Don't render on non-home pages
  if (!isHomePage) {
    return null;
  }

  // The badge display is now handled elsewhere, so this component
  // acts as a placeholder for future category section enhancements
  return null;
};
