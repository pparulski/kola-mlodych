
import { Link } from "react-router-dom";
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

const staticMenuItems = [
  { title: "Aktualności", icon: Newspaper, path: "/" },
  { title: "Lista Kół Młodych", icon: Users, path: "/kola-mlodych" },
  { title: "Nasze publikacje", icon: Book, path: "/ebooks" },
  { title: "Pliki do pobrania", icon: Download, path: "/downloads" },
];

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  // Query for static pages
  const { data: staticPages } = useQuery({
    queryKey: ['static-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('static_pages')
        .select('title, slug')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Create the menu items array with static pages
  const publicMenuItems = [
    ...staticMenuItems,
    ...(staticPages?.length ? [{
      title: "Nasze działania",
      icon: Flame,
      subItems: staticPages.map(page => ({
        title: page.title,
        path: `/static/${page.slug}`
      })),
      isSpecial: true
    }] : [])
  ];

  return (
    <>
      {publicMenuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.subItems ? (
            <>
              <SidebarMenuButton 
                className={`font-medium ${
                  item.isSpecial 
                    ? 'relative overflow-hidden group hover:text-accent transition-colors' 
                    : ''
                }`}
              >
                {item.icon && (
                  <item.icon 
                    className={`w-6 h-6 ${
                      item.isSpecial 
                        ? 'relative z-10 text-orange-500 dark:text-orange-400 animate-pulse' 
                        : ''
                    }`} 
                  />
                )}
                <span className={`${
                  item.isSpecial 
                    ? 'relative z-10 font-bold text-orange-600 dark:text-orange-400' 
                    : ''
                }`}>
                  {item.title}
                </span>
                {item.isSpecial && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 dark:from-orange-500/20 dark:via-red-500/20 dark:to-orange-500/20 animate-pulse" />
                )}
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.subItems.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <Link 
                        to={subItem.path}
                        onClick={onItemClick}
                      >
                        {subItem.title}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </>
          ) : (
            <SidebarMenuButton asChild>
              <Link 
                to={item.path}
                className="transition-colors hover:text-accent text-lg py-3"
                onClick={onItemClick}
              >
                {item.icon && <item.icon className="w-6 h-6" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      ))}
    </>
  );
}
