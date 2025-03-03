import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { CategoryForm } from "./CategoryForm";

export function CategoryManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        toast.error(`Błąd podczas pobierania kategorii: ${error.message}`);
        throw error;
      }
      return data as Category[];
    },
  });

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        toast.error(`Błąd podczas usuwania kategorii: ${error.message}`);
      } else {
        toast.success('Kategoria usunięta pomyślnie!');
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    } catch (error: any) {
      toast.error(`Wystąpił błąd: ${error.message}`);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCategory(undefined);
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  if (isLoading) {
    return <div>Ładowanie kategorii...</div>;
  }

  if (error) {
    return <div>Błąd: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Zarządzanie kategoriami</h1>
        <Button onClick={handleAddCategory}>Dodaj kategorię</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div key={category.id} className="bg-card p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                Edytuj
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                Usuń
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {showForm && (
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-bold mb-4">
            {editingCategory ? 'Edytuj kategorię' : 'Dodaj nową kategorię'}
          </h2>
          <CategoryForm 
            editingCategory={editingCategory} 
            onSuccess={handleFormSuccess} 
            onCancel={handleFormCancel}
          />
        </div>
      )}
    </div>
  );
}
