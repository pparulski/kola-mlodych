import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { StaticPage } from "@/types/staticPages";
import { MenuPosition } from "@/types/menu";
import { 
  Home, Map, BookOpen, Download, File, Info, Image, Newspaper, 
  Tag, AirVent, Activity, ArrowDown, ArrowUp, Bell, Calendar, 
  Check, Clock, Cloud, Edit, Folder, Globe, Heart, Link, 
  Lock, LogIn, LogOut, Mail, Menu, MessageSquare, Phone, 
  Search, Settings, Share, Shield, ShoppingCart, Star, 
  Sun, Trash2, User, Users, Video, X, ZoomIn
} from "lucide-react";

/**
 * Converts static pages to menu items format
 */
export const staticPagesToMenuItems = (pages: StaticPage[]): SidebarMenuItem[] => {
  return pages.map((page) => ({
    id: `page-${page.id}`,
    originalId: page.id,
    title: page.title,
    path: `/${page.slug}`,
    icon: 'File',
    position: page.sidebar_position || 100, // Use actual position or a default high number
    type: MenuItemType.STATIC_PAGE
  }));
};

/**
 * Creates the default menu items
 */
export const getDefaultMenuItems = (): SidebarMenuItem[] => {
  return [
    {
      id: 'home',
      title: 'Aktualności',
      path: '/',
      icon: 'Newspaper',
      position: 1,
      type: MenuItemType.REGULAR
    },
    {
      id: 'struktury',
      title: 'Struktury',
      path: '/struktury',
      icon: 'Map',
      position: 2,
      type: MenuItemType.REGULAR
    },
    {
      id: 'downloads',
      title: 'Pliki do pobrania',
      path: '/downloads',
      icon: 'Download',
      position: 3,
      type: MenuItemType.REGULAR
    },
    {
      id: 'ebooks',
      title: 'Publikacje',
      path: '/ebooks',
      icon: 'BookOpen',
      position: 4,
      type: MenuItemType.REGULAR
    },
    {
      id: 'about',
      title: 'O nas',
      path: '/o-nas',
      icon: 'Info',
      position: 5,
      type: MenuItemType.REGULAR
    }
  ];
};

/**
 * Get icon component based on icon name
 */
export const getIconComponent = (iconName: string) => {
  // Expanded list of supported icons
  switch (iconName) {
    case 'Home': return Home;
    case 'Map': return Map;
    case 'Download': return Download;
    case 'BookOpen': return BookOpen;
    case 'Book': return BookOpen; // Alias for consistency
    case 'Info': return Info;
    case 'Newspaper': return Newspaper;
    case 'Image': return Image;
    case 'Tag': return Tag;
    case 'AirVent': return AirVent;
    case 'Activity': return Activity;
    case 'ArrowDown': return ArrowDown;
    case 'ArrowUp': return ArrowUp;
    case 'Bell': return Bell;
    case 'Calendar': return Calendar;
    case 'Check': return Check;
    case 'Clock': return Clock;
    case 'Cloud': return Cloud;
    case 'Edit': return Edit;
    case 'Folder': return Folder;
    case 'Globe': return Globe;
    case 'Heart': return Heart;
    case 'Link': return Link;
    case 'Lock': return Lock;
    case 'LogIn': return LogIn;
    case 'LogOut': return LogOut;
    case 'Mail': return Mail;
    case 'Menu': return Menu;
    case 'MessageSquare': return MessageSquare;
    case 'Phone': return Phone;
    case 'Search': return Search;
    case 'Settings': return Settings;
    case 'Share': return Share;
    case 'Shield': return Shield;
    case 'ShoppingCart': return ShoppingCart;
    case 'Star': return Star;
    case 'Sun': return Sun;
    case 'Trash2': return Trash2;
    case 'User': return User;
    case 'Users': return Users;
    case 'Video': return Video;
    case 'X': return X;
    case 'ZoomIn': return ZoomIn;
    // Default icon if none matches
    default: return File;
  }
};

/**
 * Sorts menu items by position
 */
export const sortMenuItems = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
  return [...items].sort((a, b) => a.position - b.position);
};

/**
 * Updates positions for all menu items (1-based) ensuring they are sequential
 */
export const assignSequentialPositions = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
  return items.map((item, index) => ({
    ...item,
    position: index + 1 // 1-based position
  }));
};

/**
 * Apply custom positions and icons from the database to menu items
 */
export const applyCustomPositions = (
  items: SidebarMenuItem[], 
  positions: MenuPosition[]
): SidebarMenuItem[] => {
  // Create a copy of items to avoid mutation
  const itemsCopy = [...items];
  
  // Apply positions and icons from database
  positions.forEach(position => {
    const itemIndex = itemsCopy.findIndex(item => item.id === position.id);
    if (itemIndex !== -1) {
      itemsCopy[itemIndex] = {
        ...itemsCopy[itemIndex],
        position: position.position,
        // If position has an icon defined, use it; otherwise keep the original icon
        icon: position.icon || itemsCopy[itemIndex].icon
      };
    }
  });
  
  return itemsCopy;
};

/**
 * Ensures that all positions in menu items are unique by adjusting duplicates
 */
export const ensureUniquePositions = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
  // First, sort by position to process in order
  const sortedItems = [...items].sort((a, b) => a.position - b.position);
  
  // Map to track used positions
  const usedPositions = new Set<number>();
  
  // Process each item to ensure unique positions
  return sortedItems.map(item => {
    let position = item.position;
    
    // If position is already used, find the next available one
    while (usedPositions.has(position)) {
      position++;
    }
    
    // Mark this position as used
    usedPositions.add(position);
    
    // Return item with possibly updated position
    return {
      ...item,
      position
    };
  });
};
