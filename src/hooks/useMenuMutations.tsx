
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMenuItemIcon, updateAllMenuPositions } from "@/services/menu";
import { SidebarMenuItem } from "@/types/sidebarMenu";
import { assignSequentialPositions } from "@/utils/menu";

export function useMenuMutations() {
  const queryClient = useQueryClient();

  const updateIconMutation = useMutation({
    mutationFn: async ({ itemId, newIcon }: { itemId: string, newIcon: string }) => {
      console.log(`Mutation: Updating icon for item ${itemId} to ${newIcon}`);
      const result = await updateMenuItemIcon(itemId, newIcon);
      if (!result.success) {
        throw new Error(`Failed to update icon: ${JSON.stringify(result.error)}`);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      const { itemId, newIcon } = variables;
      console.log(`Mutation success: Updated icon for ${itemId} to ${newIcon}`);
      toast.success("Ikona została zaktualizowana");
      
      // Invalidate all related queries to ensure UI is updated everywhere
      queryClient.invalidateQueries({ queryKey: ['menu-positions'] });
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: (error) => {
      console.error("Error updating icon:", error);
      toast.error("Nie udało się zaktualizować ikony");
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (items: SidebarMenuItem[]) => {
      const sequentialItems = assignSequentialPositions(items);
      console.log("Updating menu order with sequential items:", sequentialItems);
      const { success, errors } = await updateAllMenuPositions(sequentialItems);
      if (!success) {
        console.error("Errors updating positions:", errors);
        throw new Error("Failed to update menu positions");
      }
      return { items: sequentialItems };
    },
    onSuccess: (result) => {
      console.log("Menu order updated successfully. New order:", result.items);
      toast.success("Kolejność menu została zaktualizowana");
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
      queryClient.invalidateQueries({ queryKey: ['menu-positions'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: (error) => {
      console.error("Error updating menu order:", error);
      toast.error("Nie udało się zaktualizować kolejności menu");
    }
  });

  return {
    updateIconMutation,
    updateOrderMutation,
  };
}
