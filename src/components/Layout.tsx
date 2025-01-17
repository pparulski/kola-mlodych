import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col md:pl-64">
          <div className="bg-primary p-4 text-primary-foreground text-center font-bold shadow-lg sticky top-0 z-10">
            <a 
              href="https://ozzip.pl/dolacz-do-nas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline flex items-center justify-center gap-2"
            >
              <span>Dołącz do nas!</span>
            </a>
          </div>
          <main className="flex-1 p-6">
            <SidebarTrigger className="mb-4 md:hidden">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}