
import { BookText } from "lucide-react";
import { useManageEbooksData } from "@/components/manage/ebooks/useManageEbooksData";
import { EbooksFormSection } from "@/components/manage/ebooks/EbooksFormSection";
import { EbooksListSection } from "@/components/manage/ebooks/EbooksListSection";

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
    return <div className="animate-pulse text-center py-8">Wczytywanie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fade-in">
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
