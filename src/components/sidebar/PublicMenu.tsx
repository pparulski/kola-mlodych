
import { Link } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { MenuItemType } from "@/types/sidebarMenu";
import { fetchSidebarPages } from "@/services/menuService";
import { 
  staticPagesToMenuItems, 
  getDefaultMenuItems, 
  sortMenuItems,
  getIconComponent,
  assignSequentialPositions
} from "@/utils/menuUtils";
import { LucideIcon } from "lucide-react";

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
  const defaultMenuItems = getDefaultMenuItems();

  // Combine, sort by current positions, then assign sequential positions
  const combinedItems = [...defaultMenuItems, ...staticPageMenuItems];
  const sortedItems = sortMenuItems(combinedItems);
  const allMenuItems = assignSequentialPositions(sortedItems);

  console.log("Sidebar menu items (sorted and sequential):", allMenuItems);

  if (isPagesLoading) {
    return <div className="py-2 px-3">Ładowanie menu...</div>;
  }

  return (
    <>
      {allMenuItems.map((item) => {
        // Convert string icon to component
        const IconComponent = typeof item.icon === 'string' 
          ? getIconComponent(item.icon as string) 
          : (item.icon as LucideIcon);
          
        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton asChild>
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
