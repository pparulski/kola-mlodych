
import { useState } from "react";
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
      <div className="flex-1 flex flex-col w-full">
        <JoinBanner />
        <MainContent />
      </div>
      <SidebarOverlay isOpen={isOpen} handleOverlayClick={handleOverlayClick} />
    </>
  );
}
