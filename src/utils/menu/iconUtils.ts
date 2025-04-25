
import { LucideIcon } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// Create a type for valid icon names from the dynamic imports
export type ValidIconName = keyof typeof dynamicIconImports;

/**
 * Validate if an icon name is valid
 */
export const isValidIconName = (iconName: string | null | undefined): iconName is ValidIconName => {
  if (!iconName) return false;
  const validNames = Object.keys(dynamicIconImports) as string[];
  return validNames.includes(iconName);
};

/**
 * Convert icon name from Pascal case to kebab case for dynamic imports
 */
export const toKebabCase = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Get a safe icon name that is valid for dynamic imports
 */
export const getSafeIconName = (iconName: string | null | undefined): ValidIconName => {
  // Default to 'file' icon if no valid icon is provided
  const name = iconName ? toKebabCase(iconName) : 'file';
  return isValidIconName(name) ? name : 'file';
};
