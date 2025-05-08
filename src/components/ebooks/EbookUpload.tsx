
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EbookFileUpload } from "./form/EbookFileUpload";
import { EbookFormFields } from "./form/EbookFormFields";
import { useEbookForm } from "./form/useEbookForm";
import { Ebook } from "./types";

interface EbookUploadProps {
  onSubmit: (
    id: string | undefined,
    title: string, 
    file_url: string, 
    cover_url: string, 
    publication_year: number,
    description?: string,
    page_count?: number
  ) => Promise<void>;
  // For backward compatibility with existing code
  onUploadSuccess?: (
    title: string, 
    file_url: string, 
    cover_url: string, 
    publication_year: number,
    description?: string,
    page_count?: number
  ) => Promise<void>;
  ebookToEdit?: Ebook | null;
}

export function EbookUpload({ onSubmit, onUploadSuccess, ebookToEdit }: EbookUploadProps) {
  // Convert onUploadSuccess to onSubmit format if provided
  const handleSubmitWrapper = async (
    id: string | undefined,
    title: string,
    file_url: string,
    cover_url: string,
    publication_year: number,
    description?: string,
    page_count?: number
  ) => {
    if (onUploadSuccess && !id) {
      // For backwards compatibility with Ebooks.tsx
      return onUploadSuccess(title, file_url, cover_url, publication_year, description, page_count);
    } else {
      // Normal operation with ManageEbooks.tsx
      return onSubmit(id, title, file_url, cover_url, publication_year, description, page_count);
    }
  };
  
  const {
    form,
    fileUrl,
    setFileUrl,
    coverUrl,
    setCoverUrl,
    isSubmitting,
    handleSubmit,
    isEditing,
  } = useEbookForm({ 
    onSubmit: handleSubmitWrapper, 
    ebookToEdit 
  });

  const isFormValid = form.formState.isValid && fileUrl;
  
  return (
    <div className="space-y-6 mb-8 bg-card rounded-md p-6 border border-border/50 animate-fade-in">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <EbookFormFields />
          
          <EbookFileUpload 
            fileUrl={fileUrl} 
            setFileUrl={setFileUrl}
            label="Plik PDF"
            acceptedFileTypes=".pdf"
            fieldName="fileUrl"
          />

          <EbookFileUpload 
            fileUrl={coverUrl} 
            setFileUrl={setCoverUrl}
            label="Okładka"
            acceptedFileTypes="image/*"
            showPreview={true}
            fieldName="coverUrl"
          />

          <Button 
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full transition-all hover:scale-105 duration-200"
          >
            {isSubmitting 
              ? (isEditing ? "Zapisywanie..." : "Dodawanie...") 
              : (isEditing ? "Zapisz zmiany" : "Dodaj publikację")
            }
          </Button>
        </form>
      </Form>
    </div>
  );
}
