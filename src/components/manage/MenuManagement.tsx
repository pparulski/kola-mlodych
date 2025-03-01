
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
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

export function MenuManagement() {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('position');
      
      if (error) throw error;
      return data as MenuItem[];
    }
  });

  // Update position mutation
  const updatePositionMutation = useMutation({
    mutationFn: async ({ itemId, direction }: { itemId: string, direction: 'up' | 'down' }) => {
      if (!menuItems) return;
      
      const currentIndex = menuItems.findIndex(item => item.id === itemId);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= menuItems.length) return;
      
      const targetItem = menuItems[newIndex];
      
      // Swap positions
      await supabase
        .from('menu_items')
        .update({ position: -1 }) // Temporary position
        .eq('id', itemId);
      
      await supabase
        .from('menu_items')
        .update({ position: menuItems[currentIndex].position })
        .eq('id', targetItem.id);
      
      await supabase
        .from('menu_items')
        .update({ position: targetItem.position })
        .eq('id', itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success("Pozycja została zaktualizowana");
    },
    onError: (error) => {
      console.error("Error updating position:", error);
      toast.error("Nie udało się zaktualizować pozycji");
    }
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success("Element menu został usunięty");
    },
    onError: (error) => {
      console.error("Error deleting menu item:", error);
      toast.error("Nie udało się usunąć elementu menu");
    }
  });

  // On first load, ensure default menu items exist
  useEffect(() => {
    const setupDefaultMenuItems = async () => {
      const defaultItems = [
        { title: "Aktualności", path: "/", type: "default", icon: "Newspaper" },
        { title: "Lista Kół Młodych", path: "/kola-mlodych", type: "default", icon: "Users" },
        { title: "Nasze publikacje", path: "/ebooks", type: "default", icon: "Book" },
        { title: "Pliki do pobrania", path: "/downloads", type: "default", icon: "Download" }
      ];
      
      // Check if we have any items
      const { data, error } = await supabase
        .from('menu_items')
        .select('count');
      
      if (error) {
        console.error("Error checking menu items:", error);
        return;
      }
      
      // If no menu items exist, add the defaults
      const count = parseInt(data[0]?.count as string || "0");
      if (count === 0) {
        for (let i = 0; i < defaultItems.length; i++) {
          await supabase
            .from('menu_items')
            .insert({
              ...defaultItems[i],
              position: i + 1
            });
        }
        
        // Add static pages
        const { data: pages, error: pagesError } = await supabase
          .from('static_pages')
          .select('id, title, slug, sidebar_position')
          .eq('show_in_sidebar', true)
          .order('sidebar_position');
        
        if (!pagesError && pages) {
          for (let i = 0; i < pages.length; i++) {
            await supabase
              .from('menu_items')
              .insert({
                title: pages[i].title,
                path: `/${pages[i].slug}`,
                position: defaultItems.length + i + 1,
                type: 'static_page',
                resource_id: pages[i].id
              });
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      }
    };
    
    setupDefaultMenuItems();
  }, [queryClient]);

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'default': return 'Element domyślny';
      case 'static_page': return 'Strona statyczna';
      case 'filtered_feed': return 'Kanał tematyczny';
      default: return type;
    }
  };

  if (isLoading) {
    return <div>Ładowanie menu...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Zarządzaj menu</h1>
      </div>

      <div className="space-y-4">
        {menuItems?.map((item, index) => (
          <div key={item.id} className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-muted-foreground">
                {getTypeLabel(item.type)} • Ścieżka: {item.path}
                {item.category_slug && ` • Kategorie: ${item.category_slug}`}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updatePositionMutation.mutate({ itemId: item.id, direction: 'up' })}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updatePositionMutation.mutate({ itemId: item.id, direction: 'down' })}
                disabled={index === menuItems.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDelete(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Czy na pewno chcesz usunąć ten element menu?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Usunięcie tego elementu spowoduje, że strona nie będzie dostępna z menu bocznego. Sama strona nie zostanie usunięta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (confirmDelete) {
                  deleteMenuItemMutation.mutate(confirmDelete);
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
