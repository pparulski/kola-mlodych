
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
