
import { DynamicIcon } from 'lucide-react/dynamic';
import type { LucideIcon } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// Create a type for valid icon names from the dynamic imports
export type ValidIconName = keyof typeof dynamicIconImports;

/**
 * Get icon component based on icon name
 */
export const getIconComponent = (iconName: string | null | undefined) => {
  // Default to 'file' icon if no valid icon is provided
  const safeIconName = isValidIconName(iconName) ? iconName : 'file';
  return DynamicIcon;
};

/**
 * Validate if an icon name is valid
 */
export const isValidIconName = (iconName: string | null | undefined): iconName is ValidIconName => {
  if (!iconName) return false;
  return Object.keys(dynamicIconImports).includes(iconName);
};

// Convert icon name from Pascal case to kebab case for dynamic imports
export const toKebabCase = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};
