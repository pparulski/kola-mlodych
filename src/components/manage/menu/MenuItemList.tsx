
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPicker } from "@/components/ui/icon-picker/IconPicker";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isValidIconName, getSafeIconName } from "@/utils/menu/iconUtils";
import React from "react";
import dynamic, { wrapDynamicIconImport } from "@/lib/dynamic";
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { LucideProps } from "lucide-react";

// Improved DynamicIcon component with error handling
const DynamicIcon = ({ name, ...props }: LucideProps & { name: string }) => {
  try {
    // Get the dynamic import for this icon name
    const iconImport = dynamicIconImports[name as keyof typeof dynamicIconImports];
    
    if (!iconImport) {
      console.warn(`Icon '${name}' not found in menu item list, using fallback`);
      return <FileIcon {...props} />;
    }
    
    // Wrap the import function to match our dynamic utility's expected format
    const wrappedImport = wrapDynamicIconImport(iconImport);
    
    const LucideIcon = dynamic(wrappedImport, {
      loading: <div className="h-4 w-4 animate-pulse bg-muted rounded" />,
      fallback: <FileIcon {...props} />
    });
    
    return <LucideIcon {...props} />;
  } catch (error) {
    console.error(`Error loading menu item list icon '${name}':`, error);
    return <FileIcon {...props} />;
  }
};

interface MenuItemListProps {
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

// Map menu item types to human-readable labels with consistent casing
const TYPE_LABELS: Record<string, string> = {
  default: "Domyślny",
  static_page: "Strona",
  filtered_feed: "Feed",
  category_feed: "Kategoria",
  custom: "Niestandardowy"
};

export function MenuItemList({ onEdit, onDelete }: MenuItemListProps) {
  const { data: menuItems, isLoading, refetch } = useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("position");
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        is_public: true,
        is_admin: false,
        parent_id: null,
        page_id: item.resource_id || null,
        category_id: null,
        link: item.path
      })) as MenuItem[];
    },
  });

  const handleIconUpdate = async (id: string, icon: string) => {
    if (!isValidIconName(icon)) {
      console.warn(`Attempted to update with invalid icon name: ${icon}`);
      toast.error("Nieprawidłowa ikona");
      return;
    }

    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ icon })
        .eq("id", id);
      
      if (error) throw error;
      
      // Also update menu_positions for consistency
      const { error: posError } = await supabase
        .from("menu_positions")
        .update({ icon })
        .eq("id", id);
        
      if (posError) {
        console.warn("Could not update menu_positions table:", posError);
      }
      
      toast.success("Ikona została zaktualizowana");
      refetch(); // Refresh the data after updating
    } catch (error) {
      console.error("Error updating icon:", error);
      toast.error("Nie udało się zaktualizować ikony");
    }
  };

  const getTypeLabel = (type: string): string => {
    return TYPE_LABELS[type.toLowerCase()] || "Inny";
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
          const iconName = getSafeIconName(item.icon);

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
                  >
                    <DynamicIcon name={iconName} className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <div className="p-2">
                    <IconPicker
                      value={item.icon || "file"}
                      onChange={(newIcon) => handleIconUpdate(item.id, newIcon)}
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
                  <Edit className="size-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Badge variant="outline">
                {getTypeLabel(item.type)}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
