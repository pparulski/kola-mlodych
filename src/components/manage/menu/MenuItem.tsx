
import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { GripVertical, ArrowUp, ArrowDown, File } from "lucide-react";
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { IconPicker } from "@/components/ui/icon-picker/IconPicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import * as Icons from "lucide-react";

// Interface defining the props for the MenuItem component
interface MenuItemProps {
  item: SidebarMenuItem;
  index: number;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  itemsLength: number;
  updateItemIcon: (itemId: string, newIcon: string) => void;
}

// The main MenuItem component
export function MenuItem({
  item,
  index,
  moveItem,
  itemsLength,
  updateItemIcon
}: MenuItemProps) {
  // State to control the popover
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  
  // State to track the current icon (for immediate UI feedback)
  const [currentIcon, setCurrentIcon] = useState<string>(typeof item.icon === 'string' ? item.icon : 'File');

  // Handler function to be passed to IconPicker's onChange
  const handleIconUpdate = (newIcon: string) => {
    console.log(`MenuItem: Updating icon for item ${item.id} to ${newIcon}`);
    
    // Update the local state immediately for responsive UI
    setCurrentIcon(newIcon);
    
    // Close the popover
    setIsIconPickerOpen(false);
    
    // Then call the parent function to update in the database
    updateItemIcon(item.id, newIcon);
  };

  // Function to get the display label based on the item type
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

  // Get the current icon component
  const IconComponent = currentIcon && Icons[currentIcon as keyof typeof Icons] 
    ? (Icons as any)[currentIcon]
    : Icons.File;

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`p-3 flex items-center gap-3 ${snapshot.isDragging ? 'bg-accent shadow-md' : ''}`}
        >
          {/* Drag Handle */}
          <div
            {...provided.dragHandleProps}
            className="cursor-grab p-1 -ml-1"
            aria-label="Drag menu item"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Icon Picker Integration */}
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

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.path}
              {item.position != null && <span className="ml-2 text-xs">(Pozycja: {item.position})</span>}
            </p>
          </div>

          {/* Action Buttons (Move Up/Down) */}
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

          {/* Type Label */}
          <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
            {getTypeLabel()}
          </div>
        </li>
      )}
    </Draggable>
  );
}
