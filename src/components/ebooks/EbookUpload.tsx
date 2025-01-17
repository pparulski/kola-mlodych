import { FileUpload } from "@/components/FileUpload";

interface EbookUploadProps {
  onUploadSuccess: (title: string, file_url: string) => Promise<void>;
}

export function EbookUpload({ onUploadSuccess }: EbookUploadProps) {
  return (
    <div className="mb-8">
      <FileUpload
        bucket="ebooks"
        onSuccess={onUploadSuccess}
        acceptedFileTypes=".pdf"
      />
    </div>
  );
}