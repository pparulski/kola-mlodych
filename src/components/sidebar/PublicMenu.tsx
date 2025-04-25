import { Link, useLocation } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { MenuItemType } from "@/types/sidebarMenu";
import { fetchSidebarPages, fetchMenuPositions, fetchCategoryMenuItems } from "@/services/menu";
import { staticPagesToMenuItems, getDefaultMenuItems, sortMenuItems, assignSequentialPositions, applyCustomPositions } from "@/utils/menu";
import { toKebabCase, getSafeIconName } from "@/utils/menu/iconUtils";
import dynamic from "@/lib/dynamic";
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { LucideProps } from "lucide-react";

// Memoized DynamicIcon component to prevent unnecessary re-renders
const DynamicIcon = React.memo(({ name, ...props }: LucideProps & { name: string }) => {
  const LucideIcon = dynamic(dynamicIconImports[name as keyof typeof dynamicIconImports], {
    loading: <div className="h-6 w-6 animate-pulse bg-muted rounded" />
  });
  
  return <LucideIcon {...props} />;
});

DynamicIcon.displayName = 'DynamicIcon';

export function PublicMenu({ onItemClick }: { onItemClick: () => void }) {
  const location = useLocation();
  
  // Fetch all static pages visible in sidebar
  const { data: sidebarPages, isLoading: isPagesLoading } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: fetchSidebarPages,
    staleTime: 0, // Ensure we always get fresh data
  });

  // Fetch menu positions for regular menu items with shorter staleTime
  const { data: menuPositions, isLoading: isPositionsLoading } = useQuery({
    queryKey: ['menu-positions'],
    queryFn: fetchMenuPositions,
    staleTime: 0, // Ensure we always get fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Fetch categories with show_in_menu=true
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['sidebar-categories'],
    queryFn: fetchCategoryMenuItems,
    staleTime: 0,
  });

  const isLoading = isPagesLoading || isPositionsLoading || isCategoriesLoading;

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

  // Memoize the menu items to prevent unnecessary re-renders
  const menuItems = React.useMemo(() => {
    if (!isLoading) {
      const staticPageMenuItems = sidebarPages ? staticPagesToMenuItems(sidebarPages) : [];
      const defaultMenuItems = getDefaultMenuItems();
      const categoryMenuItems = categories ? categories.map(cat => ({
        id: `category-${cat.id}`,
        originalId: cat.id,
        title: cat.name,
        path: `/category/${cat.slug}`,
        icon: 'book-open',
        position: 100,
        type: MenuItemType.CATEGORY
      })) : [];

      let combinedItems = [...defaultMenuItems, ...staticPageMenuItems, ...categoryMenuItems];
      
      if (menuPositions?.length > 0) {
        combinedItems = applyCustomPositions(combinedItems, menuPositions);
      }

      const sortedItems = sortMenuItems(combinedItems);
      return assignSequentialPositions(sortedItems);
    }
    return [];
  }, [sidebarPages, categories, menuPositions, isLoading]);

  if (isPagesLoading || isPositionsLoading || isCategoriesLoading) {
    return <div className="py-2 px-3">Ładowanie menu...</div>;
  }

  return (
    <>
      {menuItems.map((item) => {
        const iconName = getSafeIconName(typeof item.icon === 'string' ? toKebabCase(item.icon) : 'file');
        const isActive = isItemActive(item.path);
        
        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link 
                to={item.path} 
                onClick={onItemClick}
                className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
              >
                <DynamicIcon name={iconName} className="w-6 h-6" />
                <span className="flex-1">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
