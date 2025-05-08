
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { EbookFormValues } from "./ebookFormSchema";

interface EbookFileUploadProps {
  fileUrl: string;
  setFileUrl: (url: string) => void;
  label: string;
  bucket?: "ebooks";
  acceptedFileTypes?: string;
  showPreview?: boolean;
  fieldName?: "fileUrl" | "coverUrl";
}

export function EbookFileUpload({ 
  fileUrl, 
  setFileUrl, 
  label, 
  bucket = "ebooks",
  acceptedFileTypes,
  showPreview = false,
  fieldName = "fileUrl"
}: EbookFileUploadProps) {
  const form = useFormContext<EbookFormValues>();
  
  // Handle file upload success
  const handleUploadSuccess = (name: string, url: string) => {
    console.log(`Setting ${fieldName} to:`, url);
    setFileUrl(url);
    
    // Update form value
    if (form && fieldName) {
      form.setValue(fieldName, url, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  };
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {!fileUrl ? (
        <FileUpload
          bucket={bucket}
          onSuccess={handleUploadSuccess}
          acceptedFileTypes={acceptedFileTypes}
          // Add a unique identifier for each upload component
          uploadId={fieldName}
        />
      ) : (
        <div className="flex items-center gap-2">
          {showPreview && (
            <img src={fileUrl} alt="Preview" className="h-20 w-20 object-contain" />
          )}
          <span className="text-sm text-muted-foreground">
            {showPreview ? "" : "Plik został dodany"}
          </span>
          <Button variant="outline" size="sm" onClick={() => {
            setFileUrl("");
            form.setValue(fieldName, "", { shouldValidate: true });
          }}>
            Zmień {showPreview ? "obraz" : "plik"}
          </Button>
        </div>
      )}
    </div>
  );
}
