
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Category } from "@/types/categories";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { slugify } from "@/utils/slugUtils";

export const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedName, setFeedName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFeedDialog, setShowFeedDialog] = useState(false);
  const [categoryArticlesCount, setCategoryArticlesCount] = useState<Record<string, number>>({});

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    }
  });

  // Count articles per category
  useEffect(() => {
    const fetchCategoriesCount = async () => {
      if (!categories?.length) return;
      
      const counts: Record<string, number> = {};
      
      for (const category of categories) {
        const { count, error } = await supabase
          .from('news_categories')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);
        
        if (!error) {
          counts[category.id] = count || 0;
        }
      }
      
      setCategoryArticlesCount(counts);
    };
    
    fetchCategoriesCount();
  }, [categories]);

  // Add new category
  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!name.trim()) throw new Error("Nazwa kategorii nie może być pusta");
      
      const slug = slugify(name);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, slug }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewCategory("");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategoria została dodana");
    },
    onError: (error) => {
      console.error("Error adding category:", error);
      toast.error("Nie udało się dodać kategorii");
    }
  });

  // Update category
  const updateMutation = useMutation({
    mutationFn: async (category: Category) => {
      if (!category.name.trim()) throw new Error("Nazwa kategorii nie może być pusta");
      
      const slug = slugify(category.name);
      
      const { data, error } = await supabase
        .from('categories')
        .update({ name: category.name, slug })
        .eq('id', category.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategoria została zaktualizowana");
    },
    onError: (error) => {
      console.error("Error updating category:", error);
      toast.error("Nie udało się zaktualizować kategorii");
    }
  });

  // Delete category
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      return categoryId;
    },
    onSuccess: () => {
      setCategoryToDelete(null);
      setIsDeleteDialogOpen(false);
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategoria została usunięta");
    },
    onError: (error) => {
      setIsLoading(false);
      console.error("Error deleting category:", error);
      toast.error("Nie udało się usunąć kategorii");
    }
  });

  // Create feed from selected categories
  const createFeedMutation = useMutation({
    mutationFn: async ({ name, categoryIds }: { name: string, categoryIds: string[] }) => {
      if (!name.trim()) throw new Error("Nazwa feedu nie może być pusta");
      if (categoryIds.length === 0) throw new Error("Wybierz przynajmniej jedną kategorię");
      
      // Get the highest position
      const { data: menuItems, error: fetchError } = await supabase
        .from('menu_items')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      const nextPosition = menuItems && menuItems.length > 0 ? menuItems[0].position + 1 : 1;
      
      // Get the slug of the first selected category to use in the path
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('slug')
        .in('id', categoryIds)
        .limit(1);
      
      if (categoryError) throw categoryError;
      
      const categorySlug = categoryData && categoryData.length > 0 ? categoryData[0].slug : '';
      
      // Create menu item for the feed
      const { error: insertError } = await supabase
        .from('menu_items')
        .insert({
          title: name,
          path: `/?category=${categorySlug}`,
          position: nextPosition,
          type: 'category_feed',
          category_slug: categoryIds.join(',')
        });
      
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      setSelectedCategories([]);
      setFeedName("");
      setShowFeedDialog(false);
      toast.success("Feed został utworzony i dodany do menu");
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: (error) => {
      console.error("Error creating feed:", error);
      toast.error("Nie udało się utworzyć feedu");
    }
  });

  const handleAddCategory = () => {
    addMutation.mutate(newCategory);
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      updateMutation.mutate(editingCategory);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const count = categoryArticlesCount[category.id] || 0;
    
    if (count > 0) {
      setCategoryToDelete(category);
      setIsDeleteDialogOpen(true);
    } else {
      if (window.confirm(`Czy na pewno chcesz usunąć kategorię "${category.name}"?`)) {
        deleteMutation.mutate(category.id);
      }
    }
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  const handleCreateFeed = () => {
    if (selectedCategories.length === 0) {
      toast.error("Wybierz przynajmniej jedną kategorię");
      return;
    }
    
    setShowFeedDialog(true);
  };

  const confirmCreateFeed = () => {
    createFeedMutation.mutate({
      name: feedName,
      categoryIds: selectedCategories
    });
  };

  const toggleCategorySelection = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Zarządzanie kategoriami</h2>
      
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Nazwa nowej kategorii"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleAddCategory} disabled={!newCategory.trim()}>
          Dodaj kategorię
        </Button>
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="flex items-center space-x-4">
          <Button onClick={handleCreateFeed}>
            Utwórz feed z wybranych kategorii ({selectedCategories.length})
          </Button>
        </div>
      )}
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Feed</TableHead>
              <TableHead>Nazwa</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Liczba artykułów</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategorySelection(category.id)}
                  />
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{categoryArticlesCount[category.id] || 0}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edytuj
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      Usuń
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj kategorię</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Nazwa kategorii"
              value={editingCategory?.name || ""}
              onChange={(e) => setEditingCategory(prev => 
                prev ? { ...prev, name: e.target.value } : null
              )}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Anuluj</Button>
            </DialogClose>
            <Button onClick={handleUpdateCategory}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-red-500 font-semibold">
              Uwaga! Ta kategoria jest używana w {categoryArticlesCount[categoryToDelete?.id || ""] || 0} artykułach.
            </p>
            <p className="mt-2">
              Usunięcie tej kategorii spowoduje jej usunięcie ze wszystkich artykułów.
              Czy na pewno chcesz usunąć kategorię "{categoryToDelete?.name}"?
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Anuluj</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteCategory}
              disabled={isLoading}
            >
              {isLoading ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Feed Dialog */}
      <Dialog open={showFeedDialog} onOpenChange={setShowFeedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Utwórz feed z wybranych kategorii</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p>Wybrane kategorie: {selectedCategories.length}</p>
              <ul className="list-disc ml-5 mt-2">
                {categories
                  ?.filter(c => selectedCategories.includes(c.id))
                  .map(c => (
                    <li key={c.id}>{c.name}</li>
                  ))
                }
              </ul>
            </div>
            <Input
              placeholder="Nazwa feedu (widoczna w menu)"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Anuluj</Button>
            </DialogClose>
            <Button 
              onClick={confirmCreateFeed}
              disabled={!feedName.trim() || selectedCategories.length === 0}
            >
              Utwórz feed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
