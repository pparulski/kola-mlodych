
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <Label htmlFor="icon">Ikona (opcjonalnie)</Label>
        <Input
          id="icon"
          placeholder="Nazwa ikony z lucide-react"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
      </div>
    </>
  );
}
