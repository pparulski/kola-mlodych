
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Newspaper, Users, Download, Book, Flame } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Query for static pages that should appear in the sidebar
  const { data: staticPages } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('title, slug, sidebar_position')
        .eq('show_in_sidebar', true)
        .neq('slug', 'dolacz-do-nas')
        .order('sidebar_position', { ascending: true, nullsFirst: false })
        .order('title');

      if (error) throw error;
      return data;
    }
  });

  // Function to check if a path is the current one, or if the current path is a subpath
  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Handle navigation based on current route
  const handleNavigation = (path: string) => {
    if (isCurrentPath(path)) {
      // Reload the page if clicking on the current route
      window.location.reload();
    } else {
      navigate(path);
    }
    onItemClick();
  };

  // Create menu items
  const menuItems = [
    { title: "Aktualności", icon: Newspaper, path: "/" },
    { title: "Lista Kół Młodych", icon: Users, path: "/kola-mlodych" },
    { title: "Nasze publikacje", icon: Book, path: "/ebooks" },
    { title: "Pliki do pobrania", icon: Download, path: "/downloads" },
    ...(staticPages?.map(page => ({
      title: page.title,
      icon: null,
      path: `/${page.slug}`
    })) || [])
  ];

  return (
    <>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton 
            asChild={false}
            onClick={() => handleNavigation(item.path)}
            className={`transition-colors hover:text-accent text-lg py-3 ${isCurrentPath(item.path) ? 'text-accent' : ''}`}
          >
            {item.icon && <item.icon className="w-6 h-6" />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
