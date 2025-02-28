
import { Category } from "@/types/categories";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CategorySelectorProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  categories: Category[];
}

export function CategorySelector({ 
  selectedCategories, 
  setSelectedCategories, 
  categories 
}: CategorySelectorProps) {
  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter(c => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  return (
    <div>
      <Label>Kategorie</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategories.includes(category.slug) ? "default" : "outline"}
            className="cursor-pointer flex items-center gap-1 px-3 py-1 text-sm"
            onClick={() => toggleCategory(category.slug)}
          >
            {selectedCategories.includes(category.slug) && (
              <Check className="h-3 w-3" />
            )}
            {category.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
