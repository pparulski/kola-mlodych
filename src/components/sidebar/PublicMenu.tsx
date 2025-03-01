import { Link } from "react-router-dom";
import { Home, Map, BookOpen, Download, File } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StaticPage } from "@/types/staticPages";

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  const { data: sidebarPages } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('show_in_sidebar', true)
        .order('sidebar_position', { ascending: true, nullsFirst: false });

      if (error) {
        console.error("Error fetching sidebar pages:", error);
        return [];
      }

      return data as StaticPage[];
    },
  });

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link 
            to="/" 
            onClick={onItemClick}
            className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
          >
            <Home className="w-6 h-6" />
            <span className="flex-1">Aktualności</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link 
            to="/kola-mlodych" 
            onClick={onItemClick}
            className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
          >
            <Map className="w-6 h-6" />
            <span className="flex-1">Koła Młodych</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link 
            to="/downloads" 
            onClick={onItemClick}
            className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
          >
            <Download className="w-6 h-6" />
            <span className="flex-1">Pliki do pobrania</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link 
            to="/ebooks" 
            onClick={onItemClick}
            className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
          >
            <BookOpen className="w-6 h-6" />
            <span className="flex-1">Publikacje</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {/* Static Pages */}
      {sidebarPages?.map((page) => (
        <SidebarMenuItem key={page.id}>
          <SidebarMenuButton asChild>
            <Link 
              to={`/${page.slug}`} 
              onClick={onItemClick}
              className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
            >
              <File className="w-6 h-6" />
              <span className="flex-1">{page.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
