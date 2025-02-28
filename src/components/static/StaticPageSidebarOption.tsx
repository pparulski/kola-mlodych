
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StaticPageSidebarOptionProps {
  showInSidebar: boolean;
  setShowInSidebar: (value: boolean) => void;
}

export function StaticPageSidebarOption({
  showInSidebar,
  setShowInSidebar,
}: StaticPageSidebarOptionProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="show-in-sidebar"
        checked={showInSidebar}
        onCheckedChange={(checked) => setShowInSidebar(checked as boolean)}
      />
      <Label htmlFor="show-in-sidebar">Pokaż w menu bocznym</Label>
    </div>
  );
}
