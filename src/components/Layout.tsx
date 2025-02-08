
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function getPageTitle(pathname: string, staticPageTitle?: string): string {
  // Default titles for known routes
  const titles: { [key: string]: string } = {
    '/': 'Aktualności',
    '/kola-mlodych': 'Lista Kół Młodych',
    '/downloads': 'Pliki do pobrania',
    '/ebooks': 'Publikacje',
    '/auth': 'Logowanie',
  };

  // If we're on a static page route and have a title from the database, use that
  if (pathname.startsWith('/static/') && staticPageTitle) {
    return staticPageTitle;
  }

  return titles[pathname] || 'Aktualności';
}

function LayoutContent() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();

  const { data: staticPage } = useQuery({
    queryKey: ['static-page-title', location.pathname],
    queryFn: async () => {
      if (!location.pathname.startsWith('/static/')) return null;
      
      const slug = location.pathname.replace('/static/', '');
      const { data, error } = await supabase
        .from('static_pages')
        .select('title')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: location.pathname.startsWith('/static/')
  });

  const handleOverlayClick = () => {
    setOpen(false);
  };

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full">
        <Link 
          to="/static/dolacz-do-nas"
          className="bg-primary p-4 text-primary-foreground text-center font-bold shadow-lg sticky top-0 z-10 hover:bg-accent transition-colors"
        >
          <span>Dołącz do nas!</span>
        </Link>
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden h-8 w-8" onClick={() => setOpen(!open)}>
                <Menu className="h-8 w-8" />
              </SidebarTrigger>
              <h1 className="text-3xl font-bold text-primary">
                {getPageTitle(location.pathname, staticPage?.title)}
              </h1>
            </div>
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
