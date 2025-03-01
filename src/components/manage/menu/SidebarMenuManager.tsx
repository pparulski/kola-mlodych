
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { GripVertical, ArrowUp, ArrowDown, File, Home, Map, Download, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuItemType, SidebarMenuItem } from "@/types/sidebarMenu";
import { StaticPage } from "@/types/staticPages";

export function SidebarMenuManager() {
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const queryClient = useQueryClient();

  // Fetch static pages that should appear in sidebar
  const { data: staticPagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('show_in_sidebar', true)
        .order('sidebar_position', { ascending: true, nullsFirst: false });

      if (error) {
        console.error("Error fetching sidebar pages:", error);
        return [];
      }

      return data as StaticPage[];
    },
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="h-5 w-5" />;
      case 'Map': return <Map className="h-5 w-5" />;
      case 'Download': return <Download className="h-5 w-5" />;
      case 'BookOpen': return <BookOpen className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  // Convert static pages and default menu items to the unified format
  useEffect(() => {
    if (!isLoadingPages && staticPagesData) {
      // Define default menu items
      const defaultItems: SidebarMenuItem[] = [
        {
          id: 'home',
          title: 'Aktualności',
          path: '/',
          icon: 'Home',
          position: 1,
          type: MenuItemType.REGULAR
        },
        {
          id: 'kola-mlodych',
          title: 'Koła Młodych',
          path: '/kola-mlodych',
          icon: 'Map',
          position: 2,
          type: MenuItemType.REGULAR
        },
        {
          id: 'downloads',
          title: 'Pliki do pobrania',
          path: '/downloads',
          icon: 'Download',
          position: 3,
          type: MenuItemType.REGULAR
        },
        {
          id: 'ebooks',
          title: 'Publikacje',
          path: '/ebooks',
          icon: 'BookOpen',
          position: 4,
          type: MenuItemType.REGULAR
        }
      ];

      // Convert static pages to menu items format
      const staticPagesItems: SidebarMenuItem[] = staticPagesData.map((page, index) => ({
        id: `page-${page.id}`,
        originalId: page.id,
        title: page.title,
        path: `/${page.slug}`,
        icon: 'File',
        position: 5 + index,
        type: MenuItemType.STATIC_PAGE
      }));

      // Combine and sort all menu items
      const allItems = [...defaultItems, ...staticPagesItems].sort((a, b) => a.position - b.position);
      setMenuItems(allItems);
    }
  }, [staticPagesData, isLoadingPages]);

  // Mutation to save menu order
  const updateOrderMutation = useMutation({
    mutationFn: async (items: SidebarMenuItem[]) => {
      // Update static pages positions
      const staticPageItems = items
        .filter(item => item.type === MenuItemType.STATIC_PAGE);
      
      // Process each static page update individually
      for (let i = 0; i < staticPageItems.length; i++) {
        const item = staticPageItems[i];
        const { error } = await supabase
          .from('static_pages')
          .update({ sidebar_position: i + 1 })
          .eq('id', item.originalId);
        
        if (error) throw error;
      }

      // We could also save the position of regular menu items to database if needed
    },
    onSuccess: () => {
      toast.success("Kolejność menu została zaktualizowana");
      queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
    },
    onError: (error) => {
      console.error("Error updating menu order:", error);
      toast.error("Nie udało się zaktualizować kolejności menu");
    }
  });

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index + 1
    }));
    
    setMenuItems(updatedItems);
  };

  const handleSaveOrder = () => {
    updateOrderMutation.mutate(menuItems);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === menuItems.length - 1)) {
      return;
    }

    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update positions
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      position: idx + 1
    }));
    
    setMenuItems(updatedItems);
  };

  if (isLoadingPages) {
    return <div className="p-4">Ładowanie...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzaj menu bocznym</h1>
        <Button onClick={handleSaveOrder} disabled={updateOrderMutation.isPending}>
          Zapisz kolejność
        </Button>
      </div>

      <div className="bg-background border rounded-md">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sidebar-menu">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="divide-y"
              >
                {menuItems.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-3 flex items-center gap-3 ${snapshot.isDragging ? 'bg-accent' : ''}`}
                      >
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="w-8 flex justify-center">
                          {getIconComponent(item.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.path}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === menuItems.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          {item.type === MenuItemType.STATIC_PAGE ? 'Strona' : 'Menu'}
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
