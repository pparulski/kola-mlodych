
import { SidebarMenuItem } from "@/types/sidebarMenu";

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
 * Ensures that all positions in menu items are unique by adjusting duplicates
 * This is helpful when receiving data with potential position conflicts
 */
export const ensureUniquePositions = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
  // First, sort by position to process in order
  const sortedItems = [...items].sort((a, b) => a.position - b.position);
  
  // Map to track used positions
  const usedPositions = new Set<number>();
  
  // Process each item to ensure unique positions
  const uniqueItems = sortedItems.map(item => {
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
  
  // Finally, make sure positions are sequential
  return assignSequentialPositions(uniqueItems);
};

/**
 * Ensures each menu item has a default icon if none is provided
 * This prevents issues with rendering or display
 */
export const ensureDefaultIcons = (items: SidebarMenuItem[]): SidebarMenuItem[] => {
  return items.map(item => {
    // If icon is missing or empty, assign default based on type
    if (!item.icon || item.icon === '') {
      if (item.type === 'static_page') {
        return { ...item, icon: 'file' };
      } else if (item.type === 'category') {
        return { ...item, icon: 'folder' };
      } else {
        return { ...item, icon: 'link' };
      }
    }
    return item;
  });
};
