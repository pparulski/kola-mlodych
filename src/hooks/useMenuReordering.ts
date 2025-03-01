
import { useCallback } from "react";
import { SidebarMenuItem } from "@/types/sidebarMenu";
import { assignSequentialPositions } from "@/utils/menuUtils";

interface UseMenuReorderingProps {
  menuItems: SidebarMenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<SidebarMenuItem[]>>;
}

export function useMenuReordering({ menuItems, setMenuItems }: UseMenuReorderingProps) {
  /**
   * Handles drag and drop reordering
   */
  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions of all items
    const updatedItems = assignSequentialPositions(items);
    
    console.log("Updated items after drag:", updatedItems);
    setMenuItems(updatedItems);
  }, [menuItems, setMenuItems]);

  /**
   * Moves an item up or down in the list
   */
  const moveItem = useCallback((index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === menuItems.length - 1)) {
      return;
    }

    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update positions of all items
    const updatedItems = assignSequentialPositions(newItems);
    
    console.log("Updated items after move:", updatedItems);
    setMenuItems(updatedItems);
  }, [menuItems, setMenuItems]);
  
  return {
    handleDragEnd,
    moveItem
  };
}
