
import { AppSidebar } from "../AppSidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { JoinBanner } from "./JoinBanner";
import { SidebarOverlay } from "./SidebarOverlay";
import { MainContent } from "./MainContent";
import { useSearchParams } from "@/hooks/useSearchParams";
import { usePageTitle } from "@/hooks/usePageTitle";

export function LayoutContent() {
  const { isOpen, setIsOpen } = useSidebar();
  const { searchQuery, setSearchQuery, selectedCategories, setSelectedCategories } = useSearchParams();
  const { pageTitle } = usePageTitle();

  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full">
        <JoinBanner />
        <MainContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          pageTitle={pageTitle}
        />
      </div>
      <SidebarOverlay isOpen={isOpen} handleOverlayClick={handleOverlayClick} />
    </>
  );
}
