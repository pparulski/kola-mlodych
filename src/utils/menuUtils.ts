
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { StaticPage } from "@/types/staticPages";
import { Home, Map, BookOpen, Download, File } from "lucide-react";

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
      icon: 'Home',
      position: 1,
      type: MenuItemType.REGULAR
    },
    {
      id: 'kola-mlodych',
      title: 'Koła Młodych',
      path: '/kola-mlodych',
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
    }
  ];
};

/**
 * Get icon component based on icon name
 */
export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Home': return Home;
    case 'Map': return Map;
    case 'Download': return Download;
    case 'BookOpen': return BookOpen;
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
 * Updates positions for all menu items (1-based) ensuring they are unique
 */
export const assignSequentialPositions = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
  return items.map((item, index) => ({
    ...item,
    position: index + 1 // 1-based position
  }));
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
