
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// Create a type for valid icon names from the dynamic imports
export type ValidIconName = keyof typeof dynamicIconImports;

/**
 * Validate if an icon name is valid in the lucide icon library
 */
export const isValidIconName = (iconName: string | null | undefined): iconName is ValidIconName => {
  if (!iconName) return false;
  const validNames = Object.keys(dynamicIconImports) as ValidIconName[];
  return validNames.includes(iconName as ValidIconName);
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
 * List of recommended safe fallback icons ordered by preference
 */
const SAFE_FALLBACK_ICONS: ValidIconName[] = [
  'file', 
  'circle', 
  'menu',
  'bookmark',
  'clipboard'
];

/**
 * Find the first valid fallback icon from our safe list
 */
export const getSafeFallbackIcon = (): ValidIconName => {
  for (const icon of SAFE_FALLBACK_ICONS) {
    if (isValidIconName(icon)) {
      return icon;
    }
  }
  // If none of our preferred icons work, return a hardcoded one that definitely exists
  return 'circle';
};

/**
 * Get a safe icon name that is valid for dynamic imports
 * with improved fallback logic
 */
export const getSafeIconName = (iconName: string | null | undefined): ValidIconName => {
  // If no icon name provided, use default
  if (!iconName) {
    return getSafeFallbackIcon();
  }
  
  // Try the provided icon name in kebab case
  const kebabName = toKebabCase(iconName);
  if (isValidIconName(kebabName)) {
    return kebabName;
  }
  
  // Try without any transformation
  if (isValidIconName(iconName)) {
    return iconName;
  }
  
  // Log warning and use fallback
  console.warn(`Icon "${iconName}" not found in Lucide library, using fallback`);
  return getSafeFallbackIcon();
};
