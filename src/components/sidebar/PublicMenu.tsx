
import { useNavigate } from "react-router-dom";
import { Newspaper, Users, Book, Download } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Query for menu items
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu-items-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('position');

      if (error) {
        console.error("Error fetching menu items:", error);
        return [];
      }
      return data || [];
    }
  });

  // Function to check if a path is the current one, or if the current path is a subpath
  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    
    switch (iconName) {
      case 'Newspaper': return <Newspaper className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'Book': return <Book className="w-6 h-6" />;
      case 'Download': return <Download className="w-6 h-6" />;
      default: return null;
    }
  };

  // Handle navigation based on current route - reload if same route
  const handleNavigation = (path: string) => {
    if (isCurrentPath(path)) {
      // Reload the page if clicking on the current route
      window.location.reload();
    } else {
      navigate(path);
    }
    onItemClick();
  };

  if (isLoading) {
    return <div>Ładowanie menu...</div>;
  }

  if (!menuItems || menuItems.length === 0) {
    console.log("No menu items found");
    // Fallback menu items if database is empty
    return (
      <>
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={() => handleNavigation("/")}
            className={`transition-colors hover:text-accent text-lg py-3 ${isCurrentPath("/") ? 'text-accent' : ''}`}
          >
            <Newspaper className="w-6 h-6" />
            <span>Aktualności</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            onClick={() => handleNavigation("/kola-mlodych")}
            className={`transition-colors hover:text-accent text-lg py-3 ${isCurrentPath("/kola-mlodych") ? 'text-accent' : ''}`}
          >
            <Users className="w-6 h-6" />
            <span>Koła Młodych</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </>
    );
  }

  return (
    <>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton 
            asChild={false}
            onClick={() => handleNavigation(item.path)}
            className={`transition-colors hover:text-accent text-lg py-3 ${isCurrentPath(item.path) ? 'text-accent' : ''}`}
          >
            {getIconComponent(item.icon)}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
