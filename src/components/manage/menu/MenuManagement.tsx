
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, MenuItemFormData } from "@/types/menu";
import { toast } from "sonner";
import { MenuItemForm } from "@/components/manage/menu/MenuItemForm";
import { MenuItemList } from "@/components/manage/menu/MenuItemList";
import { MenuItemDeleteDialog } from "@/components/manage/menu/MenuItemDeleteDialog";

export function MenuManagement() {
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const queryClient = useQueryClient();

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDeleteItem = (item: MenuItem) => {
    setDeletingItem(item);
  };

  const upsertMutation = useMutation({
    mutationFn: async (data: {
      formData: MenuItemFormData;
      id?: string;
      position?: number;
    }) => {
      const { formData, id, position } = data;
      
      // Convert the menu item from our form data to the structure the database expects
      const menuItem = {
        title: formData.title,
        type: formData.type,
        path: formData.link || "/", // Make sure path is provided as it's required
        icon: formData.icon || null,
        resource_id: formData.page_id || null,
        category_slug: formData.category_id || null,
        position: position || 0,
      };

      if (id) {
        // Update existing item
        const { error } = await supabase
          .from("menu_items")
          .update(menuItem)
          .eq("id", id);

        if (error) throw error;
      } else {
        // Create new item
        // First, get the highest position
        const { data: existingItems, error: countError } = await supabase
          .from("menu_items")
          .select("position")
          .order("position", { ascending: false })
          .limit(1);

        if (countError) throw countError;

        const newPosition = existingItems.length > 0 ? existingItems[0].position + 1 : 0;
        
        const { error } = await supabase
          .from("menu_items")
          .insert({ ...menuItem, position: newPosition });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu_items"] });
      setEditingItem(null);
      toast.success(editingItem ? "Element menu zaktualizowany" : "Element menu dodany");
    },
    onError: (error) => {
      console.error("Error saving menu item:", error);
      toast.error("Nie udało się zapisać elementu menu");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu_items"] });
      toast.success("Element menu usunięty");
      setDeletingItem(null);
    },
    onError: (error) => {
      console.error("Error deleting menu item:", error);
      toast.error("Nie udało się usunąć elementu menu");
    },
  });

  const handleSubmit = (formData: MenuItemFormData) => {
    upsertMutation.mutate({
      formData,
      id: editingItem?.id,
      position: editingItem?.position,
    });
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      deleteMutation.mutate(deletingItem.id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Zarządzanie menu</h1>
      <p className="text-gray-500 mb-6">Dodawaj, edytuj i usuwaj elementy menu</p>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <MenuItemForm 
            editingItem={editingItem} 
            onSubmit={handleSubmit} 
            onCancel={handleCancelEdit} 
          />
        </div>

        <div>
          <MenuItemList 
            onEdit={handleEditItem} 
            onDelete={handleDeleteItem} 
          />
        </div>
      </div>

      <MenuItemDeleteDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        menuItem={deletingItem}
      />
    </div>
  );
}
