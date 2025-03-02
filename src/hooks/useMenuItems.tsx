
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SidebarMenuItem } from "@/types/sidebarMenu";
import { fetchSidebarPages, updateStaticPagesPositions } from "@/services/menuService";
import { 
  staticPagesToMenuItems, 
  getDefaultMenuItems, 
  sortMenuItems, 
  ensureUniquePositions 
} from "@/utils/menuUtils";
import { useMenuReordering } from "@/hooks/useMenuReordering";

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const queryClient = useQueryClient();
  const { handleDragEnd, moveItem } = useMenuReordering({ menuItems, setMenuItems });

  // Fetch static pages that should appear in sidebar
  const { data: staticPagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: fetchSidebarPages,
  });

  // Convert static pages and default menu items to the unified format
  useEffect(() => {
    if (!isLoadingPages && staticPagesData) {
      // Get default menu items
      const defaultItems = getDefaultMenuItems();
      
      // Convert static pages to menu items format
      const staticPagesItems = staticPagesToMenuItems(staticPagesData);

      // Combine and ensure unique positions
      const combinedItems = [...defaultItems, ...staticPagesItems];
      const itemsWithUniquePositions = ensureUniquePositions(combinedItems);
      
      // Sort after ensuring unique positions
      const allItems = sortMenuItems(itemsWithUniquePositions);
      
      console.log("Setting menu items:", allItems);
      setMenuItems(allItems);
    }
  }, [staticPagesData, isLoadingPages]);

  // Mutation to save menu order
  const updateOrderMutation = useMutation({
    mutationFn: async (items: SidebarMenuItem[]) => {
      // Ensure unique positions before saving
      const itemsWithUniquePositions = ensureUniquePositions(items);
      console.log("Updating menu order with items:", itemsWithUniquePositions);
      
      // Update database
      const { success, errors } = await updateStaticPagesPositions(itemsWithUniquePositions);
      
      if (!success) {
        console.error("Errors updating positions:", errors);
        throw new Error("Failed to update some menu positions");
      }
      
      return { items: itemsWithUniquePositions };
    },
    onSuccess: (result) => {
      console.log("Menu order updated successfully. New order:", result.items);
      toast.success("Kolejność menu została zaktualizowana");
      
      // Refresh data from the server
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
    },
    onError: (error) => {
      console.error("Error updating menu order:", error);
      toast.error("Nie udało się zaktualizować kolejności menu");
    }
  });

  const handleSaveOrder = useCallback(() => {
    console.log("Saving menu order:", menuItems);
    updateOrderMutation.mutate([...menuItems]);
  }, [menuItems, updateOrderMutation]);

  return {
    menuItems,
    isLoadingPages,
    updateOrderMutation,
    handleDragEnd,
    handleSaveOrder,
    moveItem
  };
}
