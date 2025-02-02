import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

function getPageTitle(pathname: string): string {
  // Map routes to their respective titles
  const titles: { [key: string]: string } = {
    '/': 'Aktualności',
    '/map': 'Koła Młodych',
    '/downloads': 'Do pobrania',
    '/ebooks': 'Publikacje',
    '/auth': 'Logowanie',
    '/jowita': 'Jowita',
    '/kamionka': 'Kamionka',
    '/stolowki': 'Stołówki'
  };

  return titles[pathname] || 'Aktualności';
}

function LayoutContent() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();

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
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden h-8 w-8" onClick={() => setOpen(!open)}>
              <Menu className="h-8 w-8" />
            </SidebarTrigger>
            <h1 className="text-3xl font-bold text-primary">{getPageTitle(location.pathname)}</h1>
          </div>
          <div className="max-w-4xl mx-auto">
            <Outlet />
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