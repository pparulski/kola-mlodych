
import { X } from "lucide-react";
import { Category } from "@/types/categories";

interface SelectedCategoriesProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  categories?: Category[];
}

export function SelectedCategories({
  selectedCategories = [], // Default to empty array
  setSelectedCategories,
  categories = [] // Default to empty array
}: SelectedCategoriesProps) {
  // Ensure arrays are valid
  const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const getCategoryName = (slug: string): string => {
    const category = safeCategories.find((c) => c.slug === slug);
    return category ? category.name : slug;
  };

  if (safeSelectedCategories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {safeSelectedCategories.map((slug) => (
        <div key={slug} className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
          {getCategoryName(slug)}
          <X 
            className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
            onClick={() => setSelectedCategories(safeSelectedCategories.filter(c => c !== slug))}
          />
        </div>
      ))}
    </div>
  );
}
