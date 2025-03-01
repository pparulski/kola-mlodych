
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { CategoryForm } from "@/components/manage/CategoryForm";
import { CategoryList } from "@/components/manage/CategoryList";
import { toast } from "sonner";
import { AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export function ManageCategories() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const queryClient = useQueryClient();

  // Fetch all categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
  });

  // Check if category is used in any news or static pages
  const checkCategoryUsage = async (categoryId: string) => {
    const newsQuery = supabase
      .from('news_categories')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1);
      
    const pagesQuery = supabase
      .from('static_page_categories')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1);

    const [newsResult, pagesResult] = await Promise.all([newsQuery, pagesQuery]);
    
    return {
      usedInNews: newsResult.data && newsResult.data.length > 0,
      usedInPages: pagesResult.data && pagesResult.data.length > 0
    };
  };

  // Handle deleting a category
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategoria została usunięta");
      setCategoryToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast.error("Nie udało się usunąć kategorii");
    }
  });

  const handleDelete = async (category: Category) => {
    const usage = await checkCategoryUsage(category.id);
    
    if (usage.usedInNews || usage.usedInPages) {
      setCategoryToDelete(category);
      setIsDeleteDialogOpen(true);
    } else {
      // If not used, delete without confirmation
      deleteMutation.mutate(category.id);
    }
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div>Wczytywanie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Zarządzaj kategoriami</h1>
      
      <CategoryForm 
        editingCategory={editingCategory}
        onSuccess={() => setEditingCategory(null)}
      />

      <CategoryList 
        categories={categories || []}
        onEdit={setEditingCategory}
        onDelete={handleDelete}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź usunięcie</AlertDialogTitle>
            <AlertDialogDescription>
              Kategoria "{categoryToDelete?.name}" jest używana w aktualnościach lub stronach statycznych.
              Usunięcie tej kategorii spowoduje jej usunięcie ze wszystkich powiązanych treści. 
              Ta operacja jest nieodwracalna.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
