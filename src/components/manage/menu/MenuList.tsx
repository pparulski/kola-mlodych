
import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { SidebarMenuItem } from "@/types/sidebarMenu";
import { MenuItem } from "./MenuItem";

interface MenuListProps {
  menuItems: SidebarMenuItem[];
  handleDragEnd: (result: any) => void;
  moveItem: (index: number, direction: 'up' | 'down') => void;
}

export function MenuList({ menuItems, handleDragEnd, moveItem }: MenuListProps) {
  return (
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
                <MenuItem
                  key={item.id}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  itemsLength={menuItems.length}
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
