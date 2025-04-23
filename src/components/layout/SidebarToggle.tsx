
import { Menu } from "lucide-react";

interface SidebarToggleProps {
  toggleSidebar: () => void;
}

export const SidebarToggle = ({ toggleSidebar }: SidebarToggleProps) => {
  return (
    <button 
      className="size-10 flex items-center justify-center shrink-0 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
};
