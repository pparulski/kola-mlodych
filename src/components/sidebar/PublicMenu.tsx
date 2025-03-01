
import { Link } from "react-router-dom";
import { Home, Map, BookOpen, Download, File } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { MenuItemType } from "@/types/sidebarMenu";
import { fetchSidebarPages } from "@/services/menuService";
import { staticPagesToMenuItems, getDefaultMenuItems, sortMenuItems } from "@/utils/menuUtils";

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  // Fetch all static pages visible in sidebar
  const { data: sidebarPages, isLoading: isPagesLoading } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: fetchSidebarPages,
  });

  // Convert static pages to menu items format
  const staticPageMenuItems = sidebarPages ? staticPagesToMenuItems(sidebarPages) : [];

  // Get default menu items
  const defaultMenuItems = getDefaultMenuItems().map(item => ({
    ...item,
    icon: getIconComponent(item.icon)
  }));

  // Combine both arrays and sort by position
  const allMenuItems = sortMenuItems([...defaultMenuItems, ...staticPageMenuItems]);

  console.log("Sidebar menu items (sorted):", allMenuItems);

  if (isPagesLoading) {
    return <div className="py-2 px-3">Ładowanie menu...</div>;
  }

  // Helper function to get the icon component
  function getIconComponent(iconName: string) {
    switch (iconName) {
      case 'Home': return Home;
      case 'Map': return Map;
      case 'Download': return Download;
      case 'BookOpen': return BookOpen;
      default: return File;
    }
  }

  return (
    <>
      {allMenuItems.map((item) => (
        <SidebarMenuItem key={item.path}>
          <SidebarMenuButton asChild>
            <Link 
              to={item.path} 
              onClick={onItemClick}
              className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
            >
              {typeof item.icon === 'function' ? (
                <item.icon className="w-6 h-6" />
              ) : (
                <File className="w-6 h-6" />
              )}
              <span className="flex-1">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
