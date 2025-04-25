
import { useState, useCallback, useEffect } from "react";
import { useMenuReordering } from "@/hooks/useMenuReordering";
import { useLoadMenuItems } from "@/hooks/useLoadMenuItems";
import { useMenuMutations } from "@/hooks/useMenuMutations";
import { SidebarMenuItem } from "@/types/sidebarMenu";
import { assignSequentialPositions } from "@/utils/menuUtils";

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const { handleDragEnd, moveItem } = useMenuReordering({ menuItems, setMenuItems });
  const { menuItems: loadedMenuItems, isLoading } = useLoadMenuItems();
  const { updateIconMutation, updateOrderMutation } = useMenuMutations();

  // Update local state when items are loaded
  useEffect(() => {
    if (!isLoading && loadedMenuItems.length > 0) {
      setMenuItems(loadedMenuItems);
    }
  }, [loadedMenuItems, isLoading]);

  const handleIconUpdate = useCallback((itemId: string, newIcon: string) => {
    console.log(`handleIconUpdate called for item ${itemId} with icon ${newIcon}`);
    updateIconMutation.mutate({ itemId, newIcon });
  }, [updateIconMutation]);

  const handleSaveOrder = useCallback(() => {
    console.log("Saving menu order:", menuItems);
    updateOrderMutation.mutate([...menuItems]);
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
