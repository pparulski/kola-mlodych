
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/types/categories";

interface CategoryMenuItemFieldsProps {
  categoryId: string | undefined;
  setCategoryId: (value: string) => void;
  categories: Category[] | undefined;
}

export function CategoryMenuItemFields({ 
  categoryId, 
  setCategoryId, 
  categories 
}: CategoryMenuItemFieldsProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="category_id">Kategoria</Label>
      <Select
        value={categoryId}
        onValueChange={setCategoryId}
      >
        <SelectTrigger id="category_id">
          <SelectValue placeholder="Wybierz kategorię" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
