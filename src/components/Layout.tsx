import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

function LayoutContent() {
  const { open, setOpen } = useSidebar();

  const handleOverlayClick = () => {
    setOpen(false);
  };

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full">
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
          <div className="container">
            <div className="flex items-center gap-4 mb-6">
              <SidebarTrigger className="md:hidden h-10 w-10" onClick={() => setOpen(!open)}>
                <Menu className="h-10 w-10" />
              </SidebarTrigger>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-30"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function Layout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full">
        <LayoutContent />
      </div>
    </SidebarProvider>
  );
}