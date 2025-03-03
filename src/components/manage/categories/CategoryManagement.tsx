
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "../CategoryList";
import { toast } from "sonner";

export function CategoryManagement() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch all categories
  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Category[];
    },
  });
  
  // Delete a category
  const handleDeleteCategory = async () => {
    try {
      if (!categoryToDelete) return;
      
      // First check if this category is used in any news_categories relationships
      const { data: newsCategories, error: checkError } = await supabase
        .from("news_categories")
        .select("*")
        .eq("category_id", categoryToDelete.id)
        .limit(1);
        
      if (checkError) throw checkError;
      
      if (newsCategories && newsCategories.length > 0) {
        toast.error("Nie można usunąć kategorii, która jest używana w artykułach");
        closeDeleteDialog();
        return;
      }
      
      // Delete menu items if category was in menu
      if (categoryToDelete.show_in_menu) {
        // Delete from menu_items
        const menuItemResult = await supabase
          .from("menu_items")
          .delete()
          .eq("type", "category_feed")
          .eq("resource_id", categoryToDelete.id);
          
        if (menuItemResult.error) throw menuItemResult.error;
        
        // Delete from menu_positions
        const menuPositionResult = await supabase
          .from("menu_positions")
          .delete()
          .eq("type", "category_feed")
          .eq("resource_id", categoryToDelete.id);
          
        if (menuPositionResult.error) throw menuPositionResult.error;
      }
      
      // Now delete the category
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryToDelete.id);
      
      if (error) throw error;
      
      toast.success("Kategoria została usunięta");
      
      // Invalidate queries to refresh data
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-positions"] });
      queryClient.invalidateQueries({ queryKey: ["static-pages-sidebar"] });
      
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Wystąpił błąd podczas usuwania kategorii");
    } finally {
      closeDeleteDialog();
    }
  };
  
  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  const handleFormSuccess = () => {
    setEditingCategory(null);
    refetch();
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Zarządzaj kategoriami</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <CategoryForm 
            editingCategory={editingCategory}
            onSuccess={handleFormSuccess}
          />
        </div>
        
        <div>
          {isLoading ? (
            <p>Ładowanie kategorii...</p>
          ) : (
            <CategoryList
              categories={categories || []}
              onEdit={setEditingCategory}
              onDelete={openDeleteDialog}
            />
          )}
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę kategorię?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Kategoria zostanie trwale usunięta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteDialog}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
