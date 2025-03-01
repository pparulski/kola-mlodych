import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Trash2, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

import type { MenuItem } from "@/types/menu";

export const MenuManagement = () => {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<{
    title: string;
    path: string;
    icon: string;
  }>({
    title: "",
    path: "",
    icon: "",
  });
  
  // Icons available for menu items
  const availableIcons = [
    { name: "Newspaper", label: "Aktualności" },
    { name: "Book", label: "Publikacje" },
    { name: "Download", label: "Pliki" },
    { name: "Users", label: "Koła Młodych" },
  ];

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

  // Fetch static pages for reference
  const { data: staticPages } = useQuery({
    queryKey: ['static-pages-for-menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch categories for reference
  const { data: categories } = useQuery({
    queryKey: ['categories-for-menu'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Add new menu item
  const addMutation = useMutation({
    mutationFn: async (item: typeof newItem) => {
      if (!item.title.trim() || !item.path.trim()) {
        throw new Error("Tytuł i ścieżka są wymagane");
      }

      // Get the highest position
      const { data: positionData, error: positionError } = await supabase
        .from('menu_items')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      
      if (positionError) throw positionError;
      
      const nextPosition = positionData && positionData.length > 0 
        ? positionData[0].position + 1 
        : 1;

      const { data, error } = await supabase
        .from('menu_items')
        .insert([{ 
          ...item, 
          position: nextPosition,
          type: 'custom'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewItem({
        title: "",
        path: "",
        icon: "",
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success("Element menu został dodany");
    },
    onError: (error) => {
      console.error("Error adding menu item:", error);
      toast.error("Nie udało się dodać elementu menu");
    }
  });

  // Update menu item
  const updateMutation = useMutation({
    mutationFn: async (item: MenuItem) => {
      if (!item.title.trim() || !item.path.trim()) {
        throw new Error("Tytuł i ścieżka są wymagane");
      }
      
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          title: item.title,
          path: item.path,
          icon: item.icon
        })
        .eq('id', item.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setEditingItem(null);
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success("Element menu został zaktualizowany");
    },
    onError: (error) => {
      console.error("Error updating menu item:", error);
      toast.error("Nie udało się zaktualizować elementu menu");
    }
  });

  // Delete menu item
  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success("Element menu został usunięty");
    },
    onError: (error) => {
      console.error("Error deleting menu item:", error);
      toast.error("Nie udało się usunąć elementu menu");
    }
  });

  // Move menu item
  const moveMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      if (!menuItems) throw new Error("Brak elementów menu");
      
      const currentIndex = menuItems.findIndex(item => item.id === id);
      if (currentIndex === -1) throw new Error("Element nie znaleziony");
      
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= menuItems.length) {
        throw new Error("Nie można przesunąć elementu dalej");
      }
      
      const currentItem = menuItems[currentIndex];
      const targetItem = menuItems[targetIndex];
      
      // Swap positions
      const updates = [
        { id: currentItem.id, position: targetItem.position },
        { id: targetItem.id, position: currentItem.position }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('menu_items')
          .update({ position: update.position })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success("Pozycja elementu została zmieniona");
    },
    onError: (error) => {
      console.error("Error moving menu item:", error);
      toast.error("Nie udało się zmienić pozycji elementu");
    }
  });

  const handleAddItem = () => {
    addMutation.mutate(newItem);
  };

  const handleUpdateItem = () => {
    if (editingItem) {
      updateMutation.mutate(editingItem);
    }
  };

  const handleDeleteItem = (item: MenuItem) => {
    if (window.confirm(`Czy na pewno chcesz usunąć element "${item.title}" z menu?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down') => {
    moveMutation.mutate({ id, direction });
  };

  // Get the type display name
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'static_page': return 'Strona statyczna';
      case 'category_feed': return 'Feed kategorii';
      case 'default': return 'Domyślny';
      case 'custom': return 'Niestandardowy';
      default: return type;
    }
  };

  // Get additional info for items
  const getItemInfo = (item: MenuItem) => {
    if (item.type === 'static_page' && item.resource_id) {
      const page = staticPages?.find(p => p.id === item.resource_id);
      return page ? `Strona: ${page.title}` : 'Strona nieznana';
    }
    
    if (item.type === 'category_feed' && item.category_slug) {
      const categoryIds = item.category_slug.split(',');
      const categoryNames = categoryIds
        .map(id => categories?.find(c => c.id === id)?.name)
        .filter(Boolean);
      
      return categoryNames.length > 0 
        ? `Kategorie: ${categoryNames.join(', ')}` 
        : 'Brak kategorii';
    }
    
    return '';
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Zarządzanie menu</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Dodaj nowy element
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pozycja</TableHead>
              <TableHead>Tytuł</TableHead>
              <TableHead>Ścieżka</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Informacje</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems?.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.path}</TableCell>
                <TableCell>{getTypeDisplayName(item.type)}</TableCell>
                <TableCell className="max-w-xs truncate">{getItemInfo(item)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={index === 0}
                      onClick={() => handleMoveItem(item.id, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={index === (menuItems?.length || 0) - 1}
                      onClick={() => handleMoveItem(item.id, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditDialogOpen(true);
                      }}
                      disabled={item.type !== 'custom' && item.type !== 'default'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Trash2 className="h-4 w-4" />
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
            <DialogTitle>Edytuj element menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="font-medium">Tytuł</label>
              <Input
                id="title"
                placeholder="Tytuł elementu menu"
                value={editingItem?.title || ""}
                onChange={(e) => setEditingItem(prev => 
                  prev ? { ...prev, title: e.target.value } : null
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="path" className="font-medium">Ścieżka</label>
              <Input
                id="path"
                placeholder="np. /kontakt"
                value={editingItem?.path || ""}
                onChange={(e) => setEditingItem(prev => 
                  prev ? { ...prev, path: e.target.value } : null
                )}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="icon" className="font-medium">Ikona</label>
              <Select 
                value={editingItem?.icon || ""} 
                onValueChange={(value) => setEditingItem(prev => 
                  prev ? { ...prev, icon: value } : null
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz ikonę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Brak ikony</SelectItem>
                  {availableIcons.map(icon => (
                    <SelectItem key={icon.name} value={icon.name}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Anuluj</Button>
            </DialogClose>
            <Button onClick={handleUpdateItem}>Zapisz</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj nowy element menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="new-title" className="font-medium">Tytuł</label>
              <Input
                id="new-title"
                placeholder="Tytuł elementu menu"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-path" className="font-medium">Ścieżka</label>
              <Input
                id="new-path"
                placeholder="np. /kontakt"
                value={newItem.path}
                onChange={(e) => setNewItem(prev => ({ ...prev, path: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-icon" className="font-medium">Ikona</label>
              <Select 
                value={newItem.icon} 
                onValueChange={(value) => setNewItem(prev => ({ ...prev, icon: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz ikonę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Brak ikony</SelectItem>
                  {availableIcons.map(icon => (
                    <SelectItem key={icon.name} value={icon.name}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Anuluj</Button>
            </DialogClose>
            <Button 
              onClick={handleAddItem}
              disabled={!newItem.title.trim() || !newItem.path.trim()}
            >
              Dodaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
