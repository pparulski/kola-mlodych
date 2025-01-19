import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

function LayoutContent() {
  const { open, setOpen } = useSidebar();

  // Handle overlay click to close sidebar
  const handleOverlayClick = () => {
    setOpen(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full z-40">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
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
          <SidebarTrigger className="mb-4 md:hidden">
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <div className="max-w-4xl mx-auto px-4">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay with blur effect */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />
    </>
  );
}

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <LayoutContent />
      </div>
    </SidebarProvider>
  );
}