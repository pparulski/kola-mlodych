
import { Link } from "react-router-dom";
import { Newspaper, Book, Download, LogOut, FileText, Tag, Menu } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const adminMenuItems = [
  { title: "Zarządzaj aktualnościami", icon: Newspaper, path: "/zarzadzanie-aktualnosciami" },
  { title: "Zarządzaj publikacjami", icon: Book, path: "/zarzadzanie-publikacjami" },
  { title: "Zarządzaj plikami", icon: Download, path: "/zarzadzanie-plikami" },
  { title: "Zarządzaj stronami", icon: FileText, path: "/zarzadzanie-stronami" },
  { title: "Zarządzaj kategoriami", icon: Tag, path: "/zarzadzanie-kategoriami" },
  { title: "Zarządzaj menu", icon: Menu, path: "/zarzadzanie-menu" },
];

interface AdminMenuProps {
  onItemClick: () => void;
}

export function AdminMenu({ onItemClick }: AdminMenuProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Błąd wylogowania");
        return;
      }
      
      toast.success("Wylogowano pomyślnie");
      navigate("/auth");
      
      if (isMobile) {
        onItemClick();
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Błąd wylogowania");
    }
  };

  return (
    <>
      {adminMenuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link 
              to={item.path}
              className="transition-colors hover:text-accent text-lg py-3 flex items-center gap-2"
              onClick={onItemClick}
            >
              <item.icon className="w-6 h-6" />
              <span className="flex-1">{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogout}
          className="transition-colors hover:text-accent text-lg py-3 w-full flex items-center gap-2"
        >
          <LogOut className="w-6 h-6" />
          <span className="flex-1">Wyloguj się</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}
