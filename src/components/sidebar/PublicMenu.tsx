
import { Link, useLocation } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { MenuItemType } from "@/types/sidebarMenu";
import { fetchSidebarPages, fetchMenuPositions } from "@/services/menuService";
import { 
  staticPagesToMenuItems, 
  getDefaultMenuItems, 
  sortMenuItems,
  getIconComponent,
  assignSequentialPositions,
  applyCustomPositions
} from "@/utils/menuUtils";
import { LucideIcon } from "lucide-react";

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  const location = useLocation();
  
  // Fetch all static pages visible in sidebar
  const { data: sidebarPages, isLoading: isPagesLoading } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: fetchSidebarPages,
  });

  // Fetch menu positions for regular menu items
  const { data: menuPositions, isLoading: isPositionsLoading } = useQuery({
    queryKey: ['menu-positions'],
    queryFn: fetchMenuPositions,
  });

  // Convert static pages to menu items format
  const staticPageMenuItems = sidebarPages ? staticPagesToMenuItems(sidebarPages) : [];

  // Get default menu items
  const defaultMenuItems = getDefaultMenuItems();

  // Apply custom positions from database if available
  let combinedItems = [...defaultMenuItems, ...staticPageMenuItems];
  if (menuPositions && menuPositions.length > 0) {
    combinedItems = applyCustomPositions(combinedItems, menuPositions);
  }

  // Combine, sort by current positions, then assign sequential positions
  const sortedItems = sortMenuItems(combinedItems);
  const allMenuItems = assignSequentialPositions(sortedItems);

  console.log("Sidebar menu items (sorted and sequential):", allMenuItems);

  if (isPagesLoading || isPositionsLoading) {
    return <div className="py-2 px-3">Ładowanie menu...</div>;
  }

  // Helper function to check if a menu item matches the current route
  const isItemActive = (itemPath: string) => {
    // For the homepage, only match exactly '/'
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    
    // For other paths, we check if the current location starts with the item path
    // This helps with nested routes
    return location.pathname.startsWith(itemPath);
  };

  return (
    <>
      {allMenuItems.map((item) => {
        // Convert string icon to component
        const IconComponent = typeof item.icon === 'string' 
          ? getIconComponent(item.icon as string) 
          : (item.icon as LucideIcon);
          
        const isActive = isItemActive(item.path);
        
        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton 
              asChild
              isActive={isActive}
            >
              <Link 
                to={item.path} 
                onClick={onItemClick}
                className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
              >
                <IconComponent className="w-6 h-6" />
                <span className="flex-1">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
