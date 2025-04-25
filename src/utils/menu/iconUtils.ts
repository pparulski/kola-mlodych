
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Filter and convert LucideIcons object to a record of icon components
export const VALID_ICONS: Record<string, LucideIcon> = Object.entries(LucideIcons)
  .filter(([key, value]) => 
    // Filter out non-icon exports (functions, etc.)
    typeof value === 'function' && 
    key !== 'createLucideIcon' && 
    key !== 'Icon' && 
    !key.startsWith('__')
  )
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

export type ValidIconName = keyof typeof VALID_ICONS;

/**
 * Get icon component based on icon name
 */
export const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName || !(iconName in VALID_ICONS)) {
    console.log(`Icon not found in VALID_ICONS: ${iconName}`);
    return LucideIcons.File; // Default icon
  }
  return VALID_ICONS[iconName];
};

/**
 * Validate if an icon name is valid
 */
export const isValidIconName = (iconName: string): iconName is ValidIconName => {
  const isValid = iconName in VALID_ICONS;
  if (!isValid) {
    console.log(`Invalid icon name: ${iconName}`);
  }
  return isValid;
};
