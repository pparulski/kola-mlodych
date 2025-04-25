
import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { SidebarMenuItem } from "@/types/sidebarMenu";
import { MenuItem } from "./MenuItem";

interface MenuListProps {
  menuItems: SidebarMenuItem[];
  handleDragEnd: (result: any) => void;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  updateItemIcon: (itemId: string, newIcon: string) => void;
}

export function MenuList({ menuItems, handleDragEnd, moveItem, updateItemIcon }: MenuListProps) {
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
