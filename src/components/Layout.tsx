
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutContent } from "./layout/LayoutContent";
import { ThemeProvider } from "@/components/ui/theme-provider";

export function Layout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme-preference">
      <SidebarProvider>
        <div className="flex w-full">
          <LayoutContent />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
