
import { 
  Home, Map, BookOpen, Download, File, Info, Image, Newspaper, 
  Tag, Menu, Settings, LogOut
} from "lucide-react";

// Map of valid icon names to their components
export const VALID_ICONS = {
  'Home': Home,
  'Map': Map,
  'BookOpen': BookOpen,
  'Download': Download,
  'File': File,
  'Info': Info,
  'Image': Image,
  'Newspaper': Newspaper,
  'Tag': Tag,
  'Menu': Menu,
  'Settings': Settings,
  'LogOut': LogOut
} as const;

export type ValidIconName = keyof typeof VALID_ICONS;

/**
 * Get icon component based on icon name
 */
export const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName || !(iconName in VALID_ICONS)) {
    return File; // Default icon
  }
  return VALID_ICONS[iconName as ValidIconName];
};

/**
 * Validate if an icon name is valid
 */
export const isValidIconName = (iconName: string): iconName is ValidIconName => {
  return iconName in VALID_ICONS;
};
