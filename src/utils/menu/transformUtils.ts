
import { StaticPage } from "@/types/staticPages";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { MenuPosition } from "@/types/menu";
import { ValidIconName, isValidIconName } from "./iconUtils";

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
    position: page.sidebar_position || 100,
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
 * Apply custom positions and icons from the database to menu items
 */
export const applyCustomPositions = (
  items: SidebarMenuItem[], 
  positions: MenuPosition[]
): SidebarMenuItem[] => {
  return items.map(item => {
    const position = positions.find(pos => pos.id === item.id);
    if (position) {
      return {
        ...item,
        position: position.position,
        // Only use the database icon if it's valid, otherwise keep the default
        icon: position.icon && isValidIconName(position.icon) ? position.icon : item.icon
      };
    }
    return item;
  });
};
