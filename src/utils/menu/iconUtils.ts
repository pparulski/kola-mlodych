
import { 
  Home, Map, BookOpen, Download, File, Info, Image, Newspaper, 
  Tag, Menu, Settings, LogOut, Accessibility, Activity, AlertCircle, 
  Calendar, Clock, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  User, Users, Mail, MessageSquare, Heart, Star, Share, Search, 
  Bell, Bookmark, Book, FileText, FolderOpen, Globe, ShoppingCart,
  Music, Video, Camera, PenTool, Phone, Headphones, Zap, Wifi,
  Award, Gift, Coffee, Sun, Moon, Cloud, Umbrella, Briefcase
} from "lucide-react";

// Map of valid icon names to their components
export const VALID_ICONS = {
  'Accessibility': Accessibility,
  'Activity': Activity,
  'AlertCircle': AlertCircle,
  'Award': Award,
  'Bell': Bell,
  'Bookmark': Bookmark,
  'Book': Book,
  'BookOpen': BookOpen,
  'Briefcase': Briefcase,
  'Calendar': Calendar,
  'Camera': Camera,
  'Check': Check,
  'ChevronDown': ChevronDown,
  'ChevronLeft': ChevronLeft,
  'ChevronRight': ChevronRight,
  'ChevronUp': ChevronUp,
  'Clock': Clock,
  'Cloud': Cloud,
  'Coffee': Coffee,
  'Download': Download,
  'File': File,
  'FileText': FileText,
  'FolderOpen': FolderOpen,
  'Gift': Gift,
  'Globe': Globe,
  'Headphones': Headphones,
  'Heart': Heart,
  'Home': Home,
  'Image': Image,
  'Info': Info,
  'LogOut': LogOut,
  'Mail': Mail,
  'Map': Map,
  'Menu': Menu,
  'MessageSquare': MessageSquare,
  'Moon': Moon,
  'Music': Music,
  'Newspaper': Newspaper,
  'PenTool': PenTool,
  'Phone': Phone,
  'Search': Search,
  'Settings': Settings,
  'Share': Share,
  'ShoppingCart': ShoppingCart,
  'Star': Star,
  'Sun': Sun,
  'Tag': Tag,
  'Umbrella': Umbrella,
  'User': User,
  'Users': Users,
  'Video': Video,
  'Wifi': Wifi,
  'Zap': Zap
} as const;

export type ValidIconName = keyof typeof VALID_ICONS;

/**
 * Get icon component based on icon name
 */
export const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName || !(iconName in VALID_ICONS)) {
    console.log(`Icon not found in VALID_ICONS: ${iconName}`);
    return File; // Default icon
  }
  return VALID_ICONS[iconName as ValidIconName];
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
