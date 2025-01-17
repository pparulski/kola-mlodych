import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { PublicMenu } from "./sidebar/PublicMenu";
import { AdminMenu } from "./sidebar/AdminMenu";
import { SidebarFooterContent } from "./sidebar/SidebarFooterContent";

export function AppSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
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

  const handleMenuClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarLogo />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <PublicMenu onItemClick={handleMenuClick} />
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
                <AdminMenu onItemClick={handleMenuClick} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <SidebarFooterContent />
      </SidebarFooter>
    </Sidebar>
  );
}