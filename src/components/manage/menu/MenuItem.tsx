
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { GripVertical, ArrowUp, ArrowDown, File, Home, Map, Download, BookOpen } from "lucide-react";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { LucideIcon } from "lucide-react";

interface MenuItemProps {
  item: SidebarMenuItem;
  index: number;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  itemsLength: number;
}

export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Home': return <Home className="h-5 w-5" />;
    case 'Map': return <Map className="h-5 w-5" />;
    case 'Download': return <Download className="h-5 w-5" />;
    case 'BookOpen': return <BookOpen className="h-5 w-5" />;
    default: return <File className="h-5 w-5" />;
  }
};

export function MenuItem({ item, index, moveItem, itemsLength }: MenuItemProps) {
  // Render the icon component based on whether it's a string or a LucideIcon
  const renderIcon = () => {
    if (typeof item.icon === 'string') {
      return getIconComponent(item.icon);
    } else {
      const IconComponent = item.icon as LucideIcon;
      return <IconComponent className="h-5 w-5" />;
    }
  };

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 flex items-center gap-3 ${snapshot.isDragging ? 'bg-accent' : ''}`}
        >
          <div className="cursor-grab">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="w-8 flex justify-center">
            {renderIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.path}
              {item.position && <span className="ml-2 text-xs">(Pozycja: {item.position})</span>}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-auto mr-2">
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
              disabled={index === itemsLength - 1}
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
  );
}
