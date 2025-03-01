
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Plus, Save, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CategoryManagement() {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [feedName, setFeedName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFeedNameInput, setShowFeedNameInput] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
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

  // Fetch category usage in news
  const { data: categoryUsage } = useQuery({
    queryKey: ['category-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_categories')
        .select('category_id, count');
      
      if (error) throw error;
      
      const usage: Record<string, number> = {};
      data.forEach(item => {
        usage[item.category_id] = parseInt(item.count as string);
      });
      
      return usage;
    }
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      const { error } = await supabase
        .from('categories')
        .insert({
          name,
          slug
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewCategoryName("");
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategoria została dodana");
    },
    onError: (error) => {
      console.error("Error adding category:", error);
      toast.error("Nie udało się dodać kategorii");
    }
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      const { error } = await supabase
        .from('categories')
        .update({
          name,
          slug
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategoria została zaktualizowana");
    },
    onError: (error) => {
      console.error("Error updating category:", error);
      toast.error("Nie udało się zaktualizować kategorii");
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-usage'] });
      toast.success("Kategoria została usunięta");
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast.error("Nie udało się usunąć kategorii");
    }
  });

  // Create filtered feed mutation
  const createFilteredFeedMutation = useMutation({
    mutationFn: async ({ name, categorySlugs }: { name: string, categorySlugs: string[] }) => {
      // Get the highest position
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      
      if (menuError) throw menuError;
      
      const position = menuItems && menuItems.length > 0 ? menuItems[0].position + 1 : 1;
      
      const { error } = await supabase
        .from('menu_items')
        .insert({
          title: name,
          path: `/feed/${categorySlugs.join(',')}`,
          position,
          type: 'filtered_feed',
          category_slug: categorySlugs.join(',')
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedName("");
      setSelectedCategories([]);
      setShowFeedNameInput(false);
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success("Kanał tematyczny został utworzony i dodany do menu");
    },
    onError: (error) => {
      console.error("Error creating filtered feed:", error);
      toast.error("Nie udało się utworzyć kanału tematycznego");
    }
  });

  // Handle category toggle for filtered feed
  const handleCategoryToggle = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter(s => s !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  // Handle create filtered feed
  const handleCreateFilteredFeed = () => {
    if (selectedCategories.length === 0) {
      toast.error("Wybierz co najmniej jedną kategorię");
      return;
    }
    setShowFeedNameInput(true);
  };

  // Handle save filtered feed
  const handleSaveFilteredFeed = () => {
    if (!feedName) {
      toast.error("Podaj nazwę dla kanału tematycznego");
      return;
    }
    createFilteredFeedMutation.mutate({ 
      name: feedName, 
      categorySlugs: selectedCategories 
    });
  };

  if (isLoading) {
    return <div>Ładowanie kategorii...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Zarządzaj kategoriami</h1>
      </div>

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Dodaj nową kategorię</h2>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Nazwa kategorii"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button 
            onClick={() => {
              if (newCategoryName.trim()) {
                addCategoryMutation.mutate(newCategoryName);
              } else {
                toast.error("Nazwa kategorii nie może być pusta");
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Istniejące kategorie</h2>
        <div className="space-y-2">
          {categories?.map((category) => (
            <div key={category.id} className="p-4 border rounded-lg flex items-center justify-between">
              {editingCategory?.id === category.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editName.trim()) {
                          updateCategoryMutation.mutate({
                            id: category.id,
                            name: editName
                          });
                        } else {
                          toast.error("Nazwa kategorii nie może być pusta");
                        }
                      }}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategory(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 flex-1">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={() => handleCategoryToggle(category.slug)}
                    />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Slug: {category.slug}
                        {categoryUsage && categoryUsage[category.id] > 0 && 
                          ` • Użyta w ${categoryUsage[category.id]} ${
                            categoryUsage[category.id] === 1 ? 'artykule' : 
                            categoryUsage[category.id] < 5 ? 'artykułach' : 'artykułach'
                          }`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(category);
                        setEditName(category.name);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (categoryUsage && categoryUsage[category.id] > 0) {
                          setConfirmDelete(category.id);
                        } else {
                          deleteCategoryMutation.mutate(category.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h2 className="text-lg font-semibold">Utwórz kanał tematyczny z zaznaczonych kategorii</h2>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              {selectedCategories.map((slug) => {
                const category = categories?.find(c => c.slug === slug);
                return category ? (
                  <span key={category.id} className="inline-block px-2 py-1 bg-primary/20 text-primary rounded mr-2 mb-2">
                    {category.name}
                  </span>
                ) : null;
              })}
            </div>
            {!showFeedNameInput && (
              <Button onClick={handleCreateFilteredFeed}>
                Utwórz kanał
              </Button>
            )}
          </div>
          
          {showFeedNameInput && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nazwa kanału tematycznego"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
              />
              <Button
                onClick={handleSaveFilteredFeed}
                disabled={!feedName}
              >
                Zapisz
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFeedNameInput(false)}
              >
                Anuluj
              </Button>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Czy na pewno chcesz usunąć tę kategorię?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ta kategoria jest używana w artykułach. Jej usunięcie spowoduje odłączenie jej od wszystkich artykułów.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (confirmDelete) {
                  deleteCategoryMutation.mutate(confirmDelete);
                }
              }}
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
