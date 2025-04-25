
import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { SidebarMenuItem } from "@/types/sidebarMenu";
import { MenuItem } from "./MenuItem";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MenuListProps {
  menuItems: SidebarMenuItem[];
  handleDragEnd: (result: any) => void;
  moveItem: (index: number, direction: 'up' | 'down') => void;
}

export function MenuList({ menuItems, handleDragEnd, moveItem }: MenuListProps) {
  // Add function to update item icons
  const updateItemIcon = async (itemId: string, newIcon: string) => {
    try {
      // Find the item in the menu items list
      const item = menuItems.find(item => item.id === itemId);
      if (!item) {
        console.error("Item not found:", itemId);
        return;
      }
      
      // Update the item in the database
      const { error } = await supabase
        .from("menu_items")
        .update({ icon: newIcon })
        .eq("id", itemId);
        
      if (error) throw error;
      
      toast.success("Ikona została zaktualizowana");
    } catch (error) {
      console.error("Error updating icon:", error);
      toast.error("Nie udało się zaktualizować ikony");
    }
  };

  return (
    <div className="bg-background border rounded-md">
      <div className="p-3 bg-muted/50 border-b">
        <h2 className="font-medium">Pozycje menu ({menuItems.length})</h2>
        <p className="text-sm text-muted-foreground">
          Przeciągnij lub użyj strzałek aby zmienić kolejność. Zmiany będą widoczne po kliknięciu "Zapisz kolejność".
        </p>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sidebar-menu">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="divide-y"
            >
              {menuItems.map((item, index) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  itemsLength={menuItems.length}
                  updateItemIcon={updateItemIcon}
                />
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
