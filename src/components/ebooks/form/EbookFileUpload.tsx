
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface EbookFileUploadProps {
  fileUrl: string;
  setFileUrl: (url: string) => void;
  label: string;
  bucket?: "ebooks";
  acceptedFileTypes?: string;
  showPreview?: boolean;
}

export function EbookFileUpload({ 
  fileUrl, 
  setFileUrl, 
  label, 
  bucket = "ebooks",
  acceptedFileTypes,
  showPreview = false 
}: EbookFileUploadProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {!fileUrl ? (
        <FileUpload
          bucket={bucket}
          onSuccess={(name, url) => setFileUrl(url)}
          acceptedFileTypes={acceptedFileTypes}
        />
      ) : (
        <div className="flex items-center gap-2">
          {showPreview && (
            <img src={fileUrl} alt="Preview" className="h-20 w-20 object-contain" />
          )}
          <span className="text-sm text-muted-foreground">
            {showPreview ? "" : "Plik został dodany"}
          </span>
          <Button variant="outline" size="sm" onClick={() => setFileUrl("")}>
            Zmień {showPreview ? "obraz" : "plik"}
          </Button>
        </div>
      )}
    </div>
  );
}
