
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
    <div className="flex flex-col w-full mb-4">
      <div className="flex items-start w-full">
        <div className="md:hidden mr-3">
          <SidebarToggle toggleSidebar={toggleSidebar} />
        </div>
        <div className="flex-grow w-full">
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
