
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
  selectedCategories,
  setSelectedCategories,
  availableCategories,
}: CategoryFilterMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [localCategories, setLocalCategories] = React.useState<string[]>(selectedCategories);
  
  // Sync from props to local state, but only on prop changes
  React.useEffect(() => {
    setLocalCategories(selectedCategories);
  }, [selectedCategories]);
  
  const handleSelect = (slug: string) => {
    const updatedCategories = localCategories.includes(slug)
      ? localCategories.filter((c) => c !== slug)
      : [...localCategories, slug];
    
    setLocalCategories(updatedCategories);
    setSelectedCategories(updatedCategories);
  };

  const handleRemove = (slug: string) => {
    const updatedCategories = localCategories.filter((c) => c !== slug);
    setLocalCategories(updatedCategories);
    setSelectedCategories(updatedCategories);
  };

  const clearCategories = () => {
    setLocalCategories([]);
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
        <PopoverContent className="w-[200px] p-0 rounded-md" align="start">
          <Command>
            <CommandInput placeholder="Szukaj kategorii..." />
            <CommandEmpty>Nie znaleziono kategorii.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {availableCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => handleSelect(category.slug)}
                  className="flex items-center justify-between px-4"
                >
                  <div className="flex-1">{category.name}</div>
                  {localCategories.includes(category.slug) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}

              {localCategories.length > 0 && (
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

      {localCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {localCategories.map((slug) => {
            const category = availableCategories.find((c) => c.slug === slug);
            return (
              <Badge key={slug} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                {category?.name}
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
