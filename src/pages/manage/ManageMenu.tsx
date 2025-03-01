
import { PageHeader } from "@/components/layout/PageHeader";
import { SidebarMenuManager } from "@/components/manage/menu/SidebarMenuManager";

export function ManageMenu() {
  return (
    <div className="container p-4 max-w-6xl mx-auto">
      <PageHeader 
        title="Zarządzanie Menu"
        description="Zarządzaj elementami menu i ich kolejnością"
      />
      <div className="mt-6">
        <SidebarMenuManager />
      </div>
    </div>
  );
}
