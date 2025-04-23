
import * as React from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Category } from "@/types/categories";
import { CategoryFilterButton } from "./CategoryFilterButton";

interface CategoryFilterMultiSelectProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  availableCategories: Category[];
}

export function CategoryFilterMultiSelect({
  selectedCategories = [], // Default to empty array
  setSelectedCategories,
  availableCategories = [], // Default to empty array
}: CategoryFilterMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  // Create safe versions of arrays to prevent iteration errors
  const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];
  const safeCategories = Array.isArray(availableCategories) ? availableCategories : [];

  const handleSelect = (slug: string) => {
    if (safeSelectedCategories.includes(slug)) {
      setSelectedCategories(safeSelectedCategories.filter((c) => c !== slug));
    } else {
      setSelectedCategories([...safeSelectedCategories, slug]);
    }
  };

  const handleRemove = (slug: string) => {
    setSelectedCategories(safeSelectedCategories.filter((c) => c !== slug));
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div>
            <CategoryFilterButton onClick={() => setOpen(!open)} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-fit min-w-[200px] p-0 rounded-md bg-background" align="start">
          <Command>
            <CommandInput placeholder="Szukaj kategorii..." />
            <CommandEmpty>Nie znaleziono kategorii.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {safeCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => handleSelect(category.slug)}
                  className="flex items-center justify-between px-4"
                >
                  <div className="flex-1">{category.name}</div>
                  {safeSelectedCategories.includes(category.slug) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}

              {safeSelectedCategories.length > 0 && (
                <CommandItem
                  onSelect={clearCategories}
                  className="text-destructive mt-1 px-4"
                >
                  Wyczyść filtry
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {safeSelectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {safeSelectedCategories.map((slug) => {
            const category = safeCategories.find((c) => c.slug === slug);
            return (
              <Badge key={slug} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {category?.name || slug}
                <X
                  className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => handleRemove(slug)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
