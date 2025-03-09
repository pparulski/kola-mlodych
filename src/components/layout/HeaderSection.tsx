
import { Category } from "@/types/categories";
import { PageHeader } from "./PageHeader";
import { SidebarToggle } from "./SidebarToggle";

interface HeaderSectionProps {
  isManagementPage: boolean;
  pageTitle: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  categories?: Category[];
  toggleSidebar: () => void;
}

export const HeaderSection = ({
  isManagementPage,
  pageTitle,
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  categories,
  toggleSidebar
}: HeaderSectionProps) => {
  if (isManagementPage) {
    return null;
  }

  return (
    <div className="w-full mb-4">
      <div className="relative w-full">
        <div className="absolute left-0 top-0 md:hidden">
          <SidebarToggle toggleSidebar={toggleSidebar} />
        </div>
        <div className="pl-12 md:pl-0 w-full">
          <PageHeader 
            pageTitle={pageTitle}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
};
