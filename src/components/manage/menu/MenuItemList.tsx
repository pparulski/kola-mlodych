
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@/types/categories";

interface MenuItemListProps {
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onReorder: (items: MenuItem[]) => void;
}

export function MenuItemList({ onEdit, onDelete, onReorder }: MenuItemListProps) {
  // Fetch menu items
  const { data: menuItems, isLoading: loadingItems } = useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("position");
      
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  // Fetch pages for reference
  const { data: pages, isLoading: loadingPages } = useQuery({
    queryKey: ["static_pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("static_pages")
        .select("id, title");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories for reference
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");
      
      if (error) throw error;
      return data as Category[];
    },
  });

  // Helper function to get page title
  const getPageTitle = (pageId: string) => {
    const page = pages?.find((p) => p.id === pageId);
    return page ? page.title : "Nieznana strona";
  };

  // Helper function to get category name
  const getCategoryName = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category ? category.name : "Nieznana kategoria";
  };

  // Helper function to get friendly type name
  const getTypeName = (type: string) => {
    switch (type) {
      case "default":
        return "Link";
      case "static_page":
        return "Strona statyczna";
      case "filtered_feed":
        return "Feed z kategorią";
      case "category_feed":
        return "Kategoria";
      case "custom":
        return "Niestandardowy";
      default:
        return type;
    }
  };

  if (loadingItems || loadingPages || loadingCategories) {
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
      <div className="grid gap-2">
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-4 bg-card border rounded-lg"
          >
            <div className="flex flex-col">
              <span className="font-medium">{item.title}</span>
              <div className="text-sm text-muted-foreground space-x-1">
                <span>{getTypeName(item.type)}</span>
                {item.type === "static_page" && item.page_id && (
                  <span>• {getPageTitle(item.page_id)}</span>
                )}
                {(item.type === "filtered_feed" || item.type === "category_feed") && item.category_id && (
                  <span>• {getCategoryName(item.category_id)}</span>
                )}
                {(item.type === "default" || item.type === "custom") && item.link && (
                  <span>• {item.link}</span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {item.is_public && (
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
                    Publiczne
                  </span>
                )}
                {item.is_admin && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
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
        ))}
      </div>
    </div>
  );
}
