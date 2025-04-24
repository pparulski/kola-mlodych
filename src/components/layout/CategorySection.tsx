
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
  // This component doesn't render anything as the category filtering is now handled in PageHeader
  // and the CategoryFilter component. It remains as a placeholder for future enhancements.
  return null;
};
