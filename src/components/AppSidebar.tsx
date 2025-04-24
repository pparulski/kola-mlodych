
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { PublicMenu } from "./sidebar/PublicMenu";
import { AdminMenu } from "./sidebar/AdminMenu";
import { SidebarFooterContent } from "./sidebar/SidebarFooterContent";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { isOpen, setIsOpen } = useSidebar();
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: isAdmin } = await supabase.rpc('is_admin', { 
          user_id: session.user.id 
        });
        setIsAdmin(!!isAdmin);
      } else {
        setIsAdmin(false);
      }
    };

    // Initial check
    checkAdminStatus();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (session) {
        const { data: isAdmin } = await supabase.rpc('is_admin', { 
          user_id: session.user.id 
        });
        setIsAdmin(!!isAdmin);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleMenuClick = () => {
    if (isMobile) {
      console.log("Closing sidebar on mobile after menu click");
      setIsOpen(false);
    }
  };

  return (
    <Sidebar 
      className={`fixed md:sticky top-0 h-dvh w-64 flex flex-col bg-background border-r transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <ScrollArea className="flex-1">
        <SidebarContent>
          <SidebarLogo />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <PublicMenu onItemClick={handleMenuClick} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <SidebarGroup className="border-t border-border/50 pt-4">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <div className="px-3 py-2 text-sm font-semibold text-foreground">
                      Administracja
                    </div>
                  </SidebarMenuItem>
                  <AdminMenu onItemClick={handleMenuClick} />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </ScrollArea>
      <SidebarFooter className="border-t mt-auto">
        <SidebarFooterContent />
      </SidebarFooter>
    </Sidebar>
  );
}
