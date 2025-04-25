
import { useState, useCallback, useEffect } from "react";
import { useMenuReordering } from "@/hooks/useMenuReordering";
import { useLoadMenuItems } from "@/hooks/useLoadMenuItems";
import { useMenuMutations } from "@/hooks/useMenuMutations";
import { SidebarMenuItem } from "@/types/sidebarMenu";
import { assignSequentialPositions, ensureUniquePositions, ensureDefaultIcons } from "@/utils/menu";
import { toast } from "sonner";

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const { handleDragEnd, moveItem } = useMenuReordering({ menuItems, setMenuItems });
  const { menuItems: loadedMenuItems, isLoading } = useLoadMenuItems();
  const { updateIconMutation, updateOrderMutation } = useMenuMutations();

  // Update local state when items are loaded
  useEffect(() => {
    if (!isLoading && loadedMenuItems.length > 0) {
      // Process menu items to ensure valid position values and icons
      const processedItems = ensureDefaultIcons(ensureUniquePositions(loadedMenuItems));
      setMenuItems(processedItems);
    }
  }, [loadedMenuItems, isLoading]);

  const handleIconUpdate = useCallback((itemId: string, newIcon: string) => {
    console.log(`handleIconUpdate called for item ${itemId} with icon ${newIcon}`);
    updateIconMutation.mutate({ itemId, newIcon });
  }, [updateIconMutation]);

  const handleSaveOrder = useCallback(() => {
    console.log("Saving menu order:", menuItems);
    
    // Apply sequential positions before saving
    const sequentialItems = assignSequentialPositions(menuItems);
    
    // Only save if we have items
    if (sequentialItems.length > 0) {
      updateOrderMutation.mutate([...sequentialItems]);
    } else {
      toast.error("No menu items to save");
    }
  }, [menuItems, updateOrderMutation]);

  return {
    menuItems,
    isLoadingPages: isLoading,
    updateOrderMutation,
    handleDragEnd,
    handleSaveOrder,
    moveItem,
    handleIconUpdate
  };
}
