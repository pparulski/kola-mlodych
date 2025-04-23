
import { Menu } from "lucide-react";

interface SidebarToggleProps {
  toggleSidebar: () => void;
}

export const SidebarToggle = ({ toggleSidebar }: SidebarToggleProps) => {
  return (
    <button 
      className="h-10 w-10 flex items-center justify-center"
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
};
