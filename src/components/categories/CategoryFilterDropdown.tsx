
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
  compactOnMobile?: boolean;
}

export function CategoryFilterDropdown({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
  compactOnMobile = false,
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

  // Counter for selected items
  const selectedCount = selectedCategories.length;
  const hasSelectedItems = selectedCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compactOnMobile ? (
          <Button 
            variant="outline" 
            size="icon" 
            className="relative md:hidden"
            aria-label="Filtry kategorii"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {hasSelectedItems && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {selectedCount}
              </span>
            )}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-4 lg:px-6 hidden md:flex"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <span>Kategorie</span>
            {hasSelectedItems && (
              <span className="ml-1.5 bg-primary/20 text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {selectedCount}
              </span>
            )}
          </Button>
        )}
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
