
import { BookText } from "lucide-react";
import { EbookUpload } from "@/components/ebooks/EbookUpload";
import { Ebook } from "@/components/ebooks/types";

interface EbooksFormSectionProps {
  isAddingNew: boolean;
  ebookToEdit: Ebook | null;
  onSubmit: (
    id: string | undefined,
    title: string,
    file_url: string,
    cover_url: string,
    ebook_type: string,
    description?: string,
    page_count?: number
  ) => Promise<void>;
}

export function EbooksFormSection({ 
  isAddingNew, 
  ebookToEdit, 
  onSubmit 
}: EbooksFormSectionProps) {
  return (
    <div>
      <h2 className="text-xl mb-4">
        {isAddingNew ? "Dodaj nową publikację" : "Edytuj publikację"}
      </h2>
      <EbookUpload 
        onSubmit={onSubmit} 
        ebookToEdit={ebookToEdit} 
      />
    </div>
  );
}
