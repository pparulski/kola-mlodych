
import { Menu } from "lucide-react";

interface SidebarToggleProps {
  toggleSidebar: () => void;
}

export const SidebarToggle = ({ toggleSidebar }: SidebarToggleProps) => {
  return (
    <div className="md:hidden mr-3">
      <button 
        className="flex items-center justify-center h-10 w-10"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
};
