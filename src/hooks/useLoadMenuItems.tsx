
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { 
  fetchSidebarPages, 
  fetchMenuPositions,
  fetchCategoryMenuItems,
} from "@/services/menu";
import { 
  staticPagesToMenuItems, 
  getDefaultMenuItems, 
  sortMenuItems, 
  assignSequentialPositions,
  applyCustomPositions 
} from "@/utils/menuUtils";

export function useLoadMenuItems() {
  // Fetch static pages that should appear in sidebar
  const { data: staticPagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: fetchSidebarPages,
  });

  // Fetch custom positions for regular menu items
  const { data: menuPositionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['menu-positions'],
    queryFn: fetchMenuPositions,
  });

  // Fetch categories with show_in_menu=true
  const { data: categoryMenuItemsData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['sidebar-categories'],
    queryFn: fetchCategoryMenuItems,
  });

  // Convert and combine menu items
  const menuItems = useMemo(() => {
    if (!isLoadingPages && !isLoadingPositions && !isCategoriesLoading && staticPagesData) {
      // Get default menu items
      const defaultItems = getDefaultMenuItems();
      
      // Convert static pages to menu items format
      const staticPagesItems = staticPagesToMenuItems(staticPagesData);
      
      // Get category menu items
      const categoryItems = categoryMenuItemsData ? categoryMenuItemsData.map(category => ({
        id: `category-${category.id}`,
        originalId: category.id,
        title: category.name,
        path: `/category/${category.slug}`,
        icon: 'BookOpen',
        position: 100, // Default high position, will be sorted later
        type: MenuItemType.CATEGORY
      })) : [];
      
      // Combine all items first
      let combinedItems = [...defaultItems, ...staticPagesItems, ...categoryItems];
      
      // Apply custom positions from the database
      if (menuPositionsData && menuPositionsData.length > 0) {
        combinedItems = applyCustomPositions(combinedItems, menuPositionsData);
      }
      
      // Sort and ensure sequential positions
      const sortedItems = sortMenuItems(combinedItems);
      return assignSequentialPositions(sortedItems);
    }
    return [];
  }, [staticPagesData, menuPositionsData, categoryMenuItemsData, isLoadingPages, isLoadingPositions, isCategoriesLoading]);

  const isLoading = isLoadingPages || isLoadingPositions || isCategoriesLoading;

  return {
    menuItems,
    isLoading
  };
}
