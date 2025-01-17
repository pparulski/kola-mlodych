import { Link } from "react-router-dom";
import { Newspaper, Users, Download, Book, Flame } from "lucide-react";
import { 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton 
} from "@/components/ui/sidebar";

const publicMenuItems = [
  { title: "Aktualności", icon: Newspaper, path: "/" },
  { title: "Lista Kół Młodych", icon: Users, path: "/kola-mlodych" },
  { title: "Nasze publikacje", icon: Book, path: "/ebooks" },
  { title: "Pliki do pobrania", icon: Download, path: "/downloads" },
  { 
    title: "Nasze działania",
    icon: Flame,
    subItems: [
      { title: "Jowita", path: "/static/jowita" },
      { title: "Kamionka", path: "/static/kamionka" },
      { title: "Stołówki", path: "/static/stolowki" },
    ],
  },
];

interface PublicMenuProps {
  onItemClick: () => void;
}

export function PublicMenu({ onItemClick }: PublicMenuProps) {
  return (
    <>
      {publicMenuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.subItems ? (
            <>
              <SidebarMenuButton>
                {item.icon && <item.icon className="w-6 h-6" />}
                <span>{item.title}</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                {item.subItems.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <Link 
                        to={subItem.path}
                        onClick={onItemClick}
                        className="transition-colors hover:text-accent text-lg py-3"
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