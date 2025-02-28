
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CategoryFilterButton } from "./CategoryFilterButton";
import { CategoryFilterMultiSelect } from "./CategoryFilterMultiSelect";
import { Category } from "@/types/categories";

interface CategoryFilterDropdownProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  availableCategories: Category[];
}

export function CategoryFilterDropdown({
  selectedCategories,
  setSelectedCategories,
  availableCategories,
}: CategoryFilterDropdownProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <CategoryFilterButton
            isOpen={open}
            onClick={() => setOpen(!open)}
            count={selectedCategories.length}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4" align="start">
        <CategoryFilterMultiSelect
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          availableCategories={availableCategories}
        />
      </PopoverContent>
    </Popover>
  );
}
