
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { EbookFileUpload } from "./form/EbookFileUpload";
import { EbookFormFields } from "./form/EbookFormFields";
import { useEbookForm } from "./form/useEbookForm";

interface EbookUploadProps {
  onUploadSuccess: (
    title: string, 
    file_url: string, 
    cover_url: string, 
    publication_year: number,
    description?: string,
    page_count?: number
  ) => Promise<void>;
}

export function EbookUpload({ onUploadSuccess }: EbookUploadProps) {
  const {
    form,
    fileUrl,
    setFileUrl,
    coverUrl,
    setCoverUrl,
    isSubmitting,
    handleSubmit,
  } = useEbookForm(onUploadSuccess);

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

          <Button 
            type="submit"
            disabled={!form.formState.isValid || !fileUrl || isSubmitting}
            className="w-full transition-all hover:scale-105 duration-200"
          >
            {isSubmitting ? "Dodawanie..." : "Dodaj publikację"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
