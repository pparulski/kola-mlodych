
import { Link } from "react-router-dom";
import { Newspaper, Book, Download, LogOut, FileText } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const adminMenuItems = [
  { title: "Zarządzaj aktualnościami", icon: Newspaper, path: "/manage/news" },
  { title: "Zarządzaj publikacjami", icon: Book, path: "/manage/ebooks" },
  { title: "Zarządzaj plikami", icon: Download, path: "/manage/downloads" },
  { title: "Zarządzaj stronami", icon: FileText, path: "/manage/pages" },
];

interface AdminMenuProps {
  onItemClick: () => void;
}

export function AdminMenu({ onItemClick }: AdminMenuProps) {
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Wylogowano pomyślnie",
        description: "Do zobaczenia!",
      });
      if (isMobile) {
        onItemClick();
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Błąd wylogowania",
        description: "Spróbuj ponownie później",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {adminMenuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link 
              to={item.path}
              className="transition-colors hover:text-accent text-lg py-3"
              onClick={onItemClick}
            >
              <item.icon className="w-6 h-6" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => {
            handleLogout();
            onItemClick();
          }}
          className="transition-colors hover:text-accent text-lg py-3 w-full flex items-center gap-2"
        >
          <LogOut className="w-6 h-6" />
          <span className="flex-1">Wyloguj się</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}
