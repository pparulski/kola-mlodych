
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { JoinBanner } from "./JoinBanner";
import { SidebarOverlay } from "./SidebarOverlay";
import { MainContent } from "./MainContent";

export function LayoutContent() {
  const { isOpen, setIsOpen } = useSidebar();

  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <AppSidebar />
      <JoinBanner />
      <div className="flex-1 flex flex-col w-full pt-8">
        <MainContent />
      </div>
      <SidebarOverlay isOpen={isOpen} handleOverlayClick={handleOverlayClick} />
    </>
  );
}
