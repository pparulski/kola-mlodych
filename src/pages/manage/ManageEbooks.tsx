
import { BookText } from "lucide-react";
import { useManageEbooksData } from "@/components/manage/ebooks/useManageEbooksData";
import { EbooksFormSection } from "@/components/manage/ebooks/EbooksFormSection";
import { EbooksListSection } from "@/components/manage/ebooks/EbooksListSection";
import { LoadingIndicator } from "@/components/home/LoadingIndicator";
import { SEO } from "@/components/seo/SEO";

export function ManageEbooks() {
  const {
    ebooks,
    isLoading,
    ebookToEdit,
    isAddingNew,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleDelete
  } = useManageEbooksData();

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="page-container section-spacing mt-4 animate-fade-in">
      <SEO
        title="Zarządzanie publikacjami"
        description="Panel administracyjny do zarządzania publikacjami"
      />
      
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <BookText className="h-7 w-7" />
        Zarządzaj publikacjami
      </h1>
      
      <EbooksFormSection 
        isAddingNew={isAddingNew}
        ebookToEdit={ebookToEdit}
        onSubmit={handleSubmit}
      />

      <EbooksListSection 
        ebooks={ebooks}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
}
