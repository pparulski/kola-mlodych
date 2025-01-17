import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

// Create a new component that uses the sidebar context
function LayoutContent() {
  const { openMobile, setOpen } = useSidebar();

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col md:pl-[256px] relative">
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
        <main className="flex-1 p-4 md:p-6">
          <Menu className="h-6 w-6 mb-4 md:hidden cursor-pointer" onClick={() => setOpen(true)} />
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
        {/* Overlay for mobile */}
        {openMobile && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}