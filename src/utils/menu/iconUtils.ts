
import * as LucideIcons from "lucide-react";
import { LucideIcon } from "lucide-react";

// Dynamically create VALID_ICONS from all Lucide icons
export const VALID_ICONS: { [key: string]: LucideIcon } = Object.entries(LucideIcons)
  .filter(([name, component]) => {
    // Filter out non-icon exports (like createLucideIcon)
    return typeof component === 'function' && 
           name.match(/^[A-Z]/) && // Icons start with uppercase
           name !== 'createLucideIcon';
  })
  .reduce((acc, [name, component]) => ({
    ...acc,
    [name]: component as LucideIcon
  }), {});

export type ValidIconName = keyof typeof VALID_ICONS;

/**
 * Get icon component based on icon name
 */
export const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName || !(iconName in VALID_ICONS)) {
    console.log(`Icon not found in VALID_ICONS: ${iconName}`);
    // Make sure we're using an icon that definitely exists
    return LucideIcons.FileIcon || LucideIcons.File; 
  }
  return VALID_ICONS[iconName as ValidIconName];
};

/**
 * Validate if an icon name is valid
 */
export const isValidIconName = (iconName: string): iconName is ValidIconName => {
  // Fix the type issue by explicitly typing the keys array as string[]
  const validKeys = Object.keys(VALID_ICONS) as Array<string>;
  const isValid = validKeys.includes(iconName);
  
  if (!isValid) {
    console.log(`Invalid icon name: ${iconName}`);
  }
  return isValid;
};
