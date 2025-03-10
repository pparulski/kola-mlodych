
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutContent } from "./layout/LayoutContent";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <LayoutContent />
      </div>
    </SidebarProvider>
  );
}
