import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { StaticPage } from "@/types/staticPages";

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  const location = useLocation();
  
  // Query static pages that should be shown in the sidebar
  const { data: sidebarPages } = useQuery({
    queryKey: ['static-pages-sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('show_in_sidebar', true)
        .order('sidebar_position');

      if (error) throw error;
      return data as StaticPage[];
    },
  });

  // Handle clicking on the current page - this will reload the page
  const handleLinkClick = (path: string) => {
    if (location.pathname === path) {
      // If clicking on the current page, refresh the page
      window.location.href = path;
    } else {
      // Otherwise just close the sidebar on mobile
      onItemClick();
    }
  };
  
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild 
          isActive={location.pathname === '/'}
        >
          <Link 
            to="/" 
            className="transition-colors hover:text-accent text-lg py-3"
            onClick={() => handleLinkClick('/')}
          >
            <span>Aktualności</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/kola-mlodych'}
        >
          <Link 
            to="/kola-mlodych" 
            className="transition-colors hover:text-accent text-lg py-3"
            onClick={() => handleLinkClick('/kola-mlodych')}
          >
            <span>Koła Młodych</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/ebooks'}
        >
          <Link 
            to="/ebooks" 
            className="transition-colors hover:text-accent text-lg py-3"
            onClick={() => handleLinkClick('/ebooks')}
          >
            <span>Publikacje</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton 
          asChild
          isActive={location.pathname === '/downloads'}
        >
          <Link 
            to="/downloads" 
            className="transition-colors hover:text-accent text-lg py-3"
            onClick={() => handleLinkClick('/downloads')}
          >
            <span>Materiały do pobrania</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {sidebarPages?.map((page) => (
        <SidebarMenuItem key={page.id}>
          <SidebarMenuButton 
            asChild
            isActive={location.pathname === `/${page.slug}`}
          >
            <Link 
              to={`/${page.slug}`} 
              className="transition-colors hover:text-accent text-lg py-3"
              onClick={() => handleLinkClick(`/${page.slug}`)}
            >
              <span>{page.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
