
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
  ebookToEdit?: Ebook | null;
  onCancel?: () => void;
}

export function EbookUpload({ onSubmit, ebookToEdit, onCancel }: EbookUploadProps) {
  const {
    form,
    fileUrl,
    setFileUrl,
    coverUrl,
    setCoverUrl,
    isSubmitting,
    handleSubmit,
    isEditing,
  } = useEbookForm({ onSubmit, ebookToEdit });

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
          />

          <EbookFileUpload 
            fileUrl={coverUrl} 
            setFileUrl={setCoverUrl}
            label="Okładka"
            acceptedFileTypes="image/*"
            showPreview={true}
          />

          <div className="flex gap-4">
            <Button 
              type="submit"
              disabled={!form.formState.isValid || !fileUrl || isSubmitting}
              className="flex-1 transition-all hover:scale-105 duration-200"
            >
              {isSubmitting 
                ? (isEditing ? "Zapisywanie..." : "Dodawanie...") 
                : (isEditing ? "Zapisz zmiany" : "Dodaj publikację")
              }
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
                className="transition-all hover:scale-105 duration-200"
              >
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
