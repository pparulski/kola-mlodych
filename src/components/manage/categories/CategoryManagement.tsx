
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { CategoryForm } from "@/components/manage/CategoryForm";
import { CategoryManagementList } from "@/components/manage/categories/CategoryManagementList";
import { CategoryDeleteDialog } from "@/components/manage/categories/CategoryDeleteDialog";

export function CategoryManagement() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [categoryUsageCount, setCategoryUsageCount] = useState(0);
  const queryClient = useQueryClient();

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (category: Category) => {
    // Check if the category is used in any news articles
    const { count, error } = await supabase
      .from("news_categories")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id);

    if (error) {
      console.error("Error checking category usage:", error);
      toast.error("Nie udało się sprawdzić czy kategoria jest używana");
      return;
    }

    setCategoryUsageCount(count || 0);
    setDeletingCategory(category);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Kategoria usunięta");
      setDeletingCategory(null);
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast.error("Nie udało się usunąć kategorii");
    },
  });

  const handleConfirmDelete = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Zarządzanie kategoriami"
        description="Dodawaj, edytuj i usuwaj kategorie"
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <CategoryForm 
            editingCategory={editingCategory} 
            onSuccess={handleCancelEdit} 
          />
        </div>

        <div>
          <CategoryManagementList 
            onEdit={handleEditCategory} 
            onDelete={handleDeleteCategory} 
          />
        </div>
      </div>

      <CategoryDeleteDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        category={deletingCategory}
        usageCount={categoryUsageCount}
      />
    </div>
  );
}
