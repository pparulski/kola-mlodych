
import { SidebarProvider } from "@/components/ui/sidebar";
import { LayoutContent } from "./layout/LayoutContent";
import { OrganizationStructuredData } from "./seo/OrganizationStructuredData";

export function Layout() {
  return (
    <SidebarProvider>
      <OrganizationStructuredData />
      <div className="flex w-full">
        <LayoutContent />
      </div>
    </SidebarProvider>
  );
}
