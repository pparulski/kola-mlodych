
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemListProps {
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onReorder: (items: MenuItem[]) => void;
}

export function MenuItemList({ onEdit, onDelete, onReorder }: MenuItemListProps) {
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("position");
      
      if (error) throw error;
      
      // Convert the raw data to match the MenuItem type
      return (data as any[]).map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        link: item.path,
        icon: item.icon,
        parent_id: item.parent_id || null,
        page_id: item.resource_id || null,
        category_id: item.category_id || null,
        position: item.position,
        is_public: true, // Default values since these are not in the DB yet
        is_admin: false, // Default values since these are not in the DB yet
        created_at: item.created_at
      })) as MenuItem[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return <p>Brak elementów menu.</p>;
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination || !menuItems) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;

    const reorderedItems = Array.from(menuItems);
    const [removed] = reorderedItems.splice(startIndex, 1);
    reorderedItems.splice(endIndex, 0, removed);

    // Reassign positions
    const itemsWithNewPositions = reorderedItems.map((item, index) => ({
      ...item,
      position: index,
    }));

    onReorder(itemsWithNewPositions);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Elementy menu</h2>
      <p className="text-sm text-muted-foreground">Przeciągnij aby zmienić kolejność</p>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="menu-items">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {menuItems?.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center justify-between p-4 bg-card border rounded-lg"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <div className="flex mt-1 space-x-2">
                          <Badge variant="outline">{item.type}</Badge>
                          {item.link && (
                            <Badge variant="secondary">
                              {item.link}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
