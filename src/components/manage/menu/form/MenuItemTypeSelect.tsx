
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuItemType } from "@/types/menu";

interface MenuItemTypeSelectProps {
  type: MenuItemType;
  onTypeChange: (value: MenuItemType) => void;
}

export function MenuItemTypeSelect({ type, onTypeChange }: MenuItemTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Typ</Label>
      <Select
        value={type}
        onValueChange={(value) => onTypeChange(value as MenuItemType)}
      >
        <SelectTrigger id="type">
          <SelectValue placeholder="Wybierz typ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={MenuItemType.DEFAULT}>Standardowy (link)</SelectItem>
          <SelectItem value={MenuItemType.STATIC_PAGE}>Strona statyczna</SelectItem>
          <SelectItem value={MenuItemType.FILTERED_FEED}>Feed z kategorią</SelectItem>
          <SelectItem value={MenuItemType.CATEGORY_FEED}>Kategoria</SelectItem>
          <SelectItem value={MenuItemType.CUSTOM}>Niestandardowy</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
