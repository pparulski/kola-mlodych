
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Category } from "@/types/categories";

interface CategoryFilterMultiSelectProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  availableCategories: Category[];
}

export function CategoryFilterMultiSelect({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
}: CategoryFilterMultiSelectProps) {
  const handleToggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableCategories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategories.includes(category.slug) ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            onClick={() => handleToggleCategory(category.slug)}
          >
            {category.name}
          </Badge>
        ))}
      </div>
      {selectedCategories.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearAll}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
          Wyczyść wszystkie
        </Button>
      )}
    </div>
  );
}

// Import the Button component
import { Button } from "../ui/button";
