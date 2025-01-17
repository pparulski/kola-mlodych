import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Newspaper, Users, Download, Book, Handshake, Mail, LogOut, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { Switch } from "./ui/switch";
import { useTheme } from "./ui/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";

const publicMenuItems = [
  { title: "Aktualności", icon: Newspaper, path: "/" },
  { title: "Lista Kół Młodych", icon: Users, path: "/kola-mlodych" },
  { title: "Nasze publikacje", icon: Book, path: "/publikacje" },
  { title: "Pliki do pobrania", icon: Download, path: "/downloads" },
  { 
    title: "Nasze działania",
    icon: Flame,
    subItems: [
      { title: "Jowita", path: "/static/jowita" },
      { title: "Kamionka", path: "/static/kamionka" },
      { title: "Stołówki", path: "/static/stolowki" },
    ]
  },
];

const adminMenuItems = [
  { title: "Zarządzaj aktualnościami", icon: Newspaper, path: "/manage/news" },
  { title: "Zarządzaj publikacjami", icon: Book, path: "/manage/publikacje" },
  { title: "Zarządzaj plikami", icon: Download, path: "/manage/downloads" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const { theme, setTheme } = useTheme();
  const { setOpen } = useSidebar();
  const isMobile = useIsMobile();

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
      if (isMobile) {
        setOpen(false);
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

  const handleMenuClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-6 flex justify-center">
          <img 
            src={theme === 'dark' 
              ? "/lovable-uploads/a69e03ab-2d39-4e2c-acef-8b773e96bc91.png"
              : "/lovable-uploads/f47783a4-9b20-4e2a-ad2c-ee83934d60cc.png"
            } 
            alt="Logo Koła Młodych" 
            className="w-40 h-40 object-contain"
          />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <>
                      <SidebarMenuButton className="font-medium">
                        {item.icon && <item.icon className="w-6 h-6" />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link 
                                to={subItem.path}
                                onClick={handleMenuClick}
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
                        onClick={handleMenuClick}
                      >
                        {item.icon && <item.icon className="w-6 h-6" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="flex-1" />

        {isAdmin && (
          <SidebarGroup className="mt-auto border-t border-border/50 pt-4">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className="px-3 py-2 text-sm font-semibold text-foreground">
                    Panel Admina
                  </div>
                </SidebarMenuItem>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.path}
                        className="transition-colors hover:text-accent text-lg py-3"
                        onClick={handleMenuClick}
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
                      handleMenuClick();
                    }}
                    className="transition-colors hover:text-accent text-lg py-3 w-full flex items-center gap-2"
                  >
                    <LogOut className="w-6 h-6" />
                    <span className="flex-1">Wyloguj się</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Ciemny motyw</span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <a
              href="https://ozzip.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
            >
              <Handshake className="w-4 h-4" />
              <span>OZZ Inicjatywa Pracownicza</span>
            </a>
            <a
              href="mailto:mlodzi.ip@ozzip.pl"
              className="flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>mlodzi.ip@ozzip.pl</span>
            </a>
          </div>
          <div className="text-sm text-foreground">
            OZZIP 2024
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
