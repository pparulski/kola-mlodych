
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SlidersHorizontal } from "lucide-react";
import { Category } from "@/types/categories";

interface CategoryFilterDropdownProps {
  selectedCategories: string[];
  setSelectedCategories: (value: string[]) => void;
  availableCategories: Category[];
}

export function CategoryFilterDropdown({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
}: CategoryFilterDropdownProps) {
  const handleCategoryClick = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  const handleClearCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-4 lg:px-6">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          <span>Kategorie</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuGroup>
          {availableCategories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="cursor-pointer flex items-center justify-between"
            >
              <span>{category.name}</span>
              {selectedCategories.includes(category.slug) && (
                <span className="text-primary text-sm">✓</span>
              )}
            </DropdownMenuItem>
          ))}
          {selectedCategories.length > 0 && (
            <>
              <DropdownMenuItem
                onClick={handleClearCategories}
                className="cursor-pointer text-destructive border-t mt-2 pt-2"
              >
                Wyczyść filtry
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
