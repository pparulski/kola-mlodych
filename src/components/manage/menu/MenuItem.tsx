import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { IconPicker } from "@/components/ui/icon-picker/IconPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getIconComponent, isValidIconName } from "@/utils/menu/iconUtils";

interface MenuItemProps {
  item: SidebarMenuItem;
  index: number;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  itemsLength: number;
  updateItemIcon: (itemId: string, newIcon: string) => void;
}

export function MenuItem({
  item,
  index,
  moveItem,
  itemsLength,
  updateItemIcon
}: MenuItemProps) {
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [currentIcon, setCurrentIcon] = useState<string>(
    typeof item.icon === 'string' && isValidIconName(item.icon) ? item.icon : 'File'
  );

  const handleIconUpdate = (newIcon: string) => {
    if (!isValidIconName(newIcon)) {
      console.warn(`Invalid icon name: ${newIcon}`);
      return;
    }
    
    setCurrentIcon(newIcon);
    setIsIconPickerOpen(false);
    updateItemIcon(item.id, newIcon);
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case MenuItemType.STATIC_PAGE:
        return 'Strona';
      case MenuItemType.CATEGORY:
        return 'Kategoria';
      default:
        return 'Menu';
    }
  };

  const IconComponent = getIconComponent(currentIcon);

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-3 flex items-center gap-3 ${snapshot.isDragging ? 'bg-accent shadow-md' : ''}`}
        >
          <div
            {...provided.dragHandleProps}
            className="cursor-grab p-1 -ml-1"
            aria-label="Drag menu item"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="w-auto">
            <Popover open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-2">
                <IconPicker
                  value={currentIcon}
                  onChange={handleIconUpdate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.path}
              {item.position != null && <span className="ml-2 text-xs">(Pozycja: {item.position})</span>}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                moveItem(index, 'up');
              }}
              disabled={index === 0}
              aria-label="Move item up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                moveItem(index, 'down');
              }}
              disabled={index === itemsLength - 1}
              aria-label="Move item down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
            {getTypeLabel()}
          </div>
        </li>
      )}
    </Draggable>
  );
}
