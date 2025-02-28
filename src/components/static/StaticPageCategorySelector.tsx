
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { Category } from "@/types/categories";

interface StaticPageCategorySelectorProps {
  categories?: Category[];
  selectedCategories: string[];
  toggleCategory: (slug: string) => void;
}

export function StaticPageCategorySelector({
  categories,
  selectedCategories,
  toggleCategory,
}: StaticPageCategorySelectorProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

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
