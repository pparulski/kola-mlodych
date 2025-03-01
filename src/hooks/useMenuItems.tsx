
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { StaticPage } from "@/types/staticPages";

export function useMenuItems() {
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
        .order('sidebar_position', { ascending: true });

      if (error) {
        console.error("Error fetching sidebar pages:", error);
        return [];
      }

      return data as StaticPage[];
    },
  });

  // Convert static pages and default menu items to the unified format
  useEffect(() => {
    if (!isLoadingPages && staticPagesData) {
      // Define default items
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
      const staticPagesItems: SidebarMenuItem[] = staticPagesData.map((page) => ({
        id: `page-${page.id}`,
        originalId: page.id,
        title: page.title,
        path: `/${page.slug}`,
        icon: 'File',
        position: page.sidebar_position || 100, // Use actual position or a high number
        type: MenuItemType.STATIC_PAGE
      }));

      // Combine and sort all menu items
      const allItems = [...defaultItems, ...staticPagesItems].sort((a, b) => a.position - b.position);
      
      console.log("Setting menu items:", allItems);
      setMenuItems(allItems);
    }
  }, [staticPagesData, isLoadingPages]);

  // Mutation to save menu order
  const updateOrderMutation = useMutation({
    mutationFn: async (items: SidebarMenuItem[]) => {
      console.log("Updating menu order with items:", items);
      
      // Create a batch of promises for all static page updates
      const updatePromises = [];
      const updatedPositions: Record<string, number> = {};
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const position = i + 1; // 1-based position
        updatedPositions[item.id] = position;
        
        // Only update DB for static pages
        if (item.type === MenuItemType.STATIC_PAGE && item.originalId) {
          console.log(`Updating position for ${item.title} to ${position}`);
          
          const updatePromise = supabase
            .from('static_pages')
            .update({ sidebar_position: position })
            .eq('id', item.originalId);
            
          updatePromises.push(updatePromise);
        }
      }
      
      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error("Errors updating positions:", errors);
        throw new Error("Failed to update some menu positions");
      }
      
      return { updatedPositions, items };
    },
    onSuccess: (result) => {
      console.log("Menu order updated successfully. New positions:", result.updatedPositions);
      toast.success("Kolejność menu została zaktualizowana");
      
      // Update local state with the new order
      setMenuItems(result.items.map(item => ({
        ...item,
        position: result.updatedPositions[item.id]
      })));
      
      // Refresh data from the server
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
    
    // Update positions of all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index + 1
    }));
    
    console.log("Updated items after drag:", updatedItems);
    setMenuItems(updatedItems);
  };

  const handleSaveOrder = () => {
    console.log("Saving menu order:", menuItems);
    updateOrderMutation.mutate([...menuItems]);
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
    
    console.log("Updated items after move:", updatedItems);
    setMenuItems(updatedItems);
  };

  return {
    menuItems,
    isLoadingPages,
    updateOrderMutation,
    handleDragEnd,
    handleSaveOrder,
    moveItem
  };
}
