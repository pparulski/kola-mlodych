import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { GripVertical, ArrowUp, ArrowDown, File, Home, Map, Download, BookOpen, LucideIcon } from "lucide-react"; // Consolidated LucideIcon import
import { SidebarMenuItem, MenuItemType } from "@/types/sidebarMenu";
import { IconPicker } from "@/components/ui/icon-picker/IconPicker";

// Interface defining the props for the MenuItem component
interface MenuItemProps {
  item: SidebarMenuItem;
  index: number;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  itemsLength: number;
  // Add the function prop to handle icon updates from the picker
  updateItemIcon: (itemId: string, newIcon: string) => void;
}

// (Optional) This function might still be useful if you need to render icons
// elsewhere based on string names, but IconPicker now handles the primary display.
export const getIconComponent = (iconName: string): React.ReactElement => {
  switch (iconName) {
    case 'Home': return <Home className="h-5 w-5" />;
    case 'Map': return <Map className="h-5 w-5" />;
    case 'Download': return <Download className="h-5 w-5" />;
    case 'BookOpen': return <BookOpen className="h-5 w-5" />;
    default: return <File className="h-5 w-5" />;
  }
};

// The main MenuItem component
export function MenuItem({
  item,
  index,
  moveItem,
  itemsLength,
  updateItemIcon // Destructure the new prop
}: MenuItemProps) {

  // Handler function to be passed to IconPicker's onChange
  const handleIconUpdate = (newIcon: string) => {
    console.log(`MenuItem: Updating icon for item ${item.id} to ${newIcon}`); // Debug log
    updateItemIcon(item.id, newIcon); // Call the prop function passed from parent
  };

  // Function to get the display label based on the item type
  const getTypeLabel = () => {
    switch (item.type) {
      case MenuItemType.STATIC_PAGE:
        return 'Strona';
      case MenuItemType.CATEGORY:
        return 'Kategoria';
      default:
        return 'Menu'; // Default label
    }
  };

  // Determine the icon value to pass to the IconPicker
  // IconPicker expects a string name from lucide-react icons
  const currentIconValue = typeof item.icon === 'string' ? item.icon : 'File'; // Default to 'File' if not a string

  return (
    <Draggable key={item.id} draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps} // Draggable props apply to the whole item
          // dragHandleProps are NOT applied here anymore
          className={`p-3 flex items-center gap-3 ${snapshot.isDragging ? 'bg-accent shadow-md' : ''}`} // Added shadow for dragging feedback
        >
          {/* Drag Handle: Apply dragHandleProps ONLY to this element */}
          <div
            {...provided.dragHandleProps}
            className="cursor-grab p-1 -ml-1" // Added padding for easier grabbing
            aria-label="Drag menu item" // Accessibility improvement
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Icon Picker Integration */}
          <div className="w-auto"> {/* Allow picker trigger to define width */}
            <IconPicker
              // Pass the current icon string name (or default)
              value={currentIconValue}
              // Pass the handler function to update the icon
              onChange={handleIconUpdate}
            />
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {item.path}
              {item.position != null && <span className="ml-2 text-xs">(Pozycja: {item.position})</span>} {/* Added null check for position */}
            </p>
          </div>

          {/* Action Buttons (Move Up/Down) */}
          <div className="flex items-center gap-1"> {/* Removed ml-auto mr-2 for potentially better spacing with type label */}
            <Button
              variant="ghost" // Changed variant for less visual weight
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag potentially starting on rapid clicks
                moveItem(index, 'up');
              }}
              disabled={index === 0}
              aria-label="Move item up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost" // Changed variant
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag potentially starting on rapid clicks
                moveItem(index, 'down');
              }}
              disabled={index === itemsLength - 1}
              aria-label="Move item down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Type Label */}
          <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground whitespace-nowrap"> {/* Added nowrap */}
            {getTypeLabel()}
          </div>
        </li>
      )}
    </Draggable>
  );
}