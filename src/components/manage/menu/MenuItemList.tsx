
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
      // Convert database items to MenuItem type with default values for missing properties
      return (data || []).map(item => ({
        ...item,
        is_public: true, // Set default value
        is_admin: false, // Set default value
        parent_id: null,
        page_id: item.resource_id || null,
        category_id: null,
        link: item.path
      })) as MenuItem[];
    },
  });

  // Handle icon update
  const handleIconUpdate = async (id: string, icon: string) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ icon })
        .eq("id", id);
      
      if (error) throw error;
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
          const IconComponent = item.icon ? (Icons as any)[item.icon] : Icons.FileIcon;
          
          return (
            <div
              key={item.id}
              className="p-3 flex items-center gap-3"
            >
              <div className="w-32">
                <IconPicker
                  value={item.icon || ""}
                  onChange={(newIcon) => handleIconUpdate(item.id, newIcon)}
                />
              </div>
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
