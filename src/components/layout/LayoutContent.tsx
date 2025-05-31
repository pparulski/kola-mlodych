
import { memo, useCallback } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";
import { JoinBanner } from "./JoinBanner";
import { SidebarOverlay } from "./SidebarOverlay";
import { MainContent } from "./MainContent";

export const LayoutContent = memo(function LayoutContent() {
  const { isOpen, setIsOpen } = useSidebar();

  const handleOverlayClick = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full">
        <JoinBanner />
        <MainContent />
      </div>
      <SidebarOverlay isOpen={isOpen} handleOverlayClick={handleOverlayClick} />
    </>
  );
});
