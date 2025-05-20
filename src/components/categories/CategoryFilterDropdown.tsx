
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
  // Local state to track the selected categories
  const [localSelectedCategories, setLocalSelectedCategories] = React.useState<string[]>(selectedCategories);
  
  // Sync local state with props (one-way, parent to child)
  React.useEffect(() => {
    setLocalSelectedCategories(selectedCategories);
  }, [selectedCategories]);
  
  // Update function with debounce mechanism
  const handleCategoryUpdate = React.useCallback((newCategories: string[]) => {
    setLocalSelectedCategories(newCategories);
    setSelectedCategories(newCategories);
  }, [setSelectedCategories]);

  // Handle category item click
  const handleCategoryClick = (slug: string) => {
    const newCategories = localSelectedCategories.includes(slug)
      ? localSelectedCategories.filter((c) => c !== slug)
      : [...localSelectedCategories, slug];
    
    handleCategoryUpdate(newCategories);
  };

  // Handle clear categories click
  const handleClearCategories = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from closing
    handleCategoryUpdate([]);
  };

  // Count for selected items
  const selectedCount = localSelectedCategories.length;
  const hasSelectedItems = selectedCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compactOnMobile ? (
          <Button 
            variant="outline" 
            size="icon"
            className="relative md:hidden h-10 w-10"
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
            className="h-10 px-4 w-40 hidden md:flex"
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
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuGroup>
          {availableCategories.map((category) => (
            <DropdownMenuItem
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="cursor-pointer flex items-center justify-between"
            >
              <span>{category.name}</span>
              {localSelectedCategories.includes(category.slug) && (
                <span className="text-primary text-sm">✓</span>
              )}
            </DropdownMenuItem>
          ))}
          {localSelectedCategories.length > 0 && (
            <DropdownMenuItem
              onClick={handleClearCategories}
              className="cursor-pointer text-destructive border-t mt-2 pt-2"
            >
              Wyczyść filtry
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
