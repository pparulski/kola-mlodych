
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MenuItemType } from "@/types/sidebarMenu";
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
} from "@/utils/menu";

export function useLoadMenuItems() {
  // Fetch all menu data in parallel
  const { data: staticPagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: fetchSidebarPages,
  });

  const { data: menuPositionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['menu-positions'],
    queryFn: fetchMenuPositions,
  });

  const { data: categoryMenuItemsData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['sidebar-categories'],
    queryFn: fetchCategoryMenuItems,
  });

  // Convert and combine menu items
  const menuItems = useMemo(() => {
    if (!isLoadingPages && !isLoadingPositions && !isCategoriesLoading && staticPagesData) {
      // Gather all potential menu items first
      const defaultItems = getDefaultMenuItems();
      const staticPagesItems = staticPagesToMenuItems(staticPagesData);
      const categoryItems = categoryMenuItemsData ? categoryMenuItemsData.map(category => ({
        id: `category-${category.id}`,
        originalId: category.id,
        title: category.name,
        path: `/category/${category.slug}`,
        icon: 'book-open',
        position: 100, // Default high position, will be overridden if in menuPositionsData
        type: MenuItemType.CATEGORY
      })) : [];
      
      // Combine all items
      let combinedItems = [...defaultItems, ...staticPagesItems, ...categoryItems];
      
      // If we have position data, apply it to override the defaults
      if (menuPositionsData && menuPositionsData.length > 0) {
        console.log("Applying custom positions from database to", combinedItems.length, "menu items");
        combinedItems = applyCustomPositions(combinedItems, menuPositionsData);
      } else {
        console.log("No custom positions found, using default positions");
      }
      
      // Ensure items are sorted and have sequential positions
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
