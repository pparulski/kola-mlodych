import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Newspaper, Users, Download, Book, Building2, Mail, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";

const publicMenuItems = [
  { title: "Aktualności", icon: Newspaper, path: "/" },
  { title: "Lista Kół Młodych", icon: Users, path: "/map" },
  { title: "Pliki do pobrania", icon: Download, path: "/downloads" },
  { title: "Publikacje", icon: Book, path: "/ebooks" },
];

const adminMenuItems = [
  { title: "Zarządzaj aktualnościami", icon: Newspaper, path: "/manage/news" },
  { title: "Zarządzaj plikami", icon: Download, path: "/manage/downloads" },
  { title: "Zarządzaj publikacjami", icon: Book, path: "/manage/ebooks" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: isAdmin } = await supabase.rpc('is_admin', { 
          user_id: session.user.id 
        });
        setIsAdmin(!!isAdmin);
      }
    };

    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Wylogowano pomyślnie",
        description: "Do zobaczenia!",
      });
      navigate("/");
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
    <Sidebar>
      <SidebarContent>
        <div className="p-6 flex justify-center">
          <img 
            src="/lovable-uploads/a69e03ab-2d39-4e2c-acef-8b773e96bc91.png" 
            alt="Logo Koła Młodych" 
            className="w-40 h-40 object-contain"
          />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      className="transition-colors hover:text-accent text-lg py-3"
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isAdmin && (
                <>
                  <SidebarMenuItem>
                    <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                      Panel Admina
                    </div>
                  </SidebarMenuItem>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.path}
                          className="transition-colors hover:text-accent text-lg py-3"
                        >
                          <item.icon className="w-6 h-6" />
                          <span>{item.title}</span>
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
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <a
              href="https://ozzip.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>OZZ Inicjatywa Pracownicza</span>
            </a>
            <a
              href="mailto:mlodzi.ip@ozzip.pl"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>mlodzi.ip@ozzip.pl</span>
            </a>
          </div>
          <div className="text-sm text-muted-foreground">
            OZZIP 2024
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}