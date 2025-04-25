import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPicker } from "@/components/ui/icon-picker/IconPicker";
import { isValidIconName } from "@/utils/menu/iconUtils";
import { DynamicIcon } from 'lucide-react/dynamic';
import { toKebabCase } from "@/utils/menu/iconUtils";

interface DefaultMenuItemFieldsProps {
  link: string;
  setLink: (value: string) => void;
  icon: string;
  setIcon: (value: string) => void;
}

export function DefaultMenuItemFields({ 
  link, 
  setLink, 
  icon, 
  setIcon 
}: DefaultMenuItemFieldsProps) {
  // Ensure icon has a valid default value in kebab case
  const safeIcon = React.useMemo(() => {
    return toKebabCase(icon) || "file";
  }, [icon]);

  const handleIconChange = (newIcon: string) => {
    console.log(`Icon selected: ${newIcon}`);
    setIcon(newIcon);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="link">Link</Label>
        <Input
          id="link"
          placeholder="URL"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">Ikona</Label>
        <IconPicker
          value={safeIcon}
          onChange={handleIconChange}
        />
      </div>
    </>
  );
}
