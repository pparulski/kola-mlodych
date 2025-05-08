
import { SidebarMenuManager } from "@/components/manage/menu/SidebarMenuManager";
import { SEO } from "@/components/seo/SEO";

export function ManageMenu() {
  return (
    <div className="page-container section-spacing mt-4">
      <SEO
        title="Zarządzaj menu"
        description="Panel administracyjny do zarządzania elementami menu"
      />
      <SidebarMenuManager />
    </div>
  );
}
