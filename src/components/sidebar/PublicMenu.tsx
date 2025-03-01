
import { Link } from "react-router-dom";
import { Home, Map, BookOpen, Download, File } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StaticPage } from "@/types/staticPages";
import { MenuItemType } from "@/types/sidebarMenu";

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  // Fetch all static pages visible in sidebar
  const { data: sidebarPages, isLoading: isPagesLoading } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('show_in_sidebar', true)
        .order('sidebar_position', { ascending: true });

      if (error) {
        console.error("Error fetching sidebar pages:", error);
        return [];
      }

      return data as StaticPage[];
    },
  });

  // Define default menu items with their positions
  const defaultMenuItems = [
    { path: "/", icon: Home, title: "Aktualności", position: 1, type: MenuItemType.REGULAR },
    { path: "/kola-mlodych", icon: Map, title: "Koła Młodych", position: 2, type: MenuItemType.REGULAR },
    { path: "/downloads", icon: Download, title: "Pliki do pobrania", position: 3, type: MenuItemType.REGULAR },
    { path: "/ebooks", icon: BookOpen, title: "Publikacje", position: 4, type: MenuItemType.REGULAR },
  ];

  // Convert static pages to menu items format
  const staticPageMenuItems = sidebarPages?.map(page => ({
    path: `/${page.slug}`,
    icon: File,
    title: page.title,
    position: page.sidebar_position || 100,
    type: MenuItemType.STATIC_PAGE,
    id: page.id
  })) || [];

  // Combine both arrays and sort by position
  const allMenuItems = [...defaultMenuItems, ...staticPageMenuItems].sort(
    (a, b) => (a.position || 100) - (b.position || 100)
  );

  console.log("Sidebar menu items (sorted):", allMenuItems);

  if (isPagesLoading) {
    return <div className="py-2 px-3">Ładowanie menu...</div>;
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
