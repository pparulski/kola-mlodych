import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker } from "@/components/ui/icon-picker/IconPicker";
import { toast } from "sonner";
import * as Icons from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MenuItemListProps {
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export function MenuItemList({ onEdit, onDelete }: MenuItemListProps) {
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("position");
      
      if (error) throw error;
      return (data || []).map(item => {
        console.log('Menu Item Raw Data:', item);
        return ({
          ...item,
          is_public: true,
          is_admin: false,
          parent_id: null,
          page_id: item.resource_id || null,
          category_id: null,
          link: item.path
        });
      }) as MenuItem[];
    },
  });

  const handleIconUpdate = async (id: string, icon: string) => {
    console.log(`Updating icon for item ${id} to: ${icon}`);
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ icon })
        .eq("id", id);
      
      if (error) {
        console.error('Icon Update Error:', error);
        throw error;
      }
      
      toast.success("Ikona została zaktualizowana");
    } catch (error) {
      console.error("Error updating icon:", error);
      toast.error("Nie udało się zaktualizować ikony");
    }
  };

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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Elementy menu</h2>
      <div className="divide-y border rounded-lg">
        {menuItems.map((item) => {
          const IconComponent = item.icon && Icons[item.icon as keyof typeof Icons] 
            ? (Icons as any)[item.icon] 
            : Icons.FileIcon;
          
          console.log(`Rendering menu item: ${item.id}, Icon: ${item.icon}`);
          
          return (
            <div
              key={item.id}
              className="p-3 flex items-center gap-3"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9"
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <div className="p-2">
                    <IconPicker
                      value={item.icon || ""}
                      onChange={(newIcon) => {
                        console.log(`Icon Picker onChange: ${newIcon}`);
                        handleIconUpdate(item.id, newIcon);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.link}
                </p>
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
              <Badge variant="outline">
                {item.type}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
