import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface EbookUploadProps {
  onUploadSuccess: (title: string, file_url: string, cover_url: string, publication_year: number) => Promise<void>;
}

export function EbookUpload({ onUploadSuccess }: EbookUploadProps) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !fileUrl || !coverUrl) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onUploadSuccess(title, fileUrl, coverUrl, publicationYear);
      setTitle("");
      setFileUrl("");
      setCoverUrl("");
      setPublicationYear(new Date().getFullYear());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="space-y-2">
        <Label htmlFor="title">Tytuł</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Wprowadź tytuł ebooka"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="year">Rok publikacji</Label>
        <Input
          id="year"
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          value={publicationYear}
          onChange={(e) => setPublicationYear(parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label>Plik PDF</Label>
        {!fileUrl ? (
          <FileUpload
            bucket="ebooks"
            onSuccess={(name, url) => setFileUrl(url)}
            acceptedFileTypes=".pdf"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Plik został dodany</span>
            <Button variant="outline" size="sm" onClick={() => setFileUrl("")}>
              Zmień plik
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Okładka</Label>
        {!coverUrl ? (
          <FileUpload
            bucket="ebooks"
            onSuccess={(name, url) => setCoverUrl(url)}
            acceptedFileTypes="image/*"
          />
        ) : (
          <div className="flex items-center gap-2">
            <img src={coverUrl} alt="Cover preview" className="h-20 w-20 object-contain" />
            <Button variant="outline" size="sm" onClick={() => setCoverUrl("")}>
              Zmień okładkę
            </Button>
          </div>
        )}
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={!title || !fileUrl || !coverUrl || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Dodawanie..." : "Dodaj ebooka"}
      </Button>
    </div>
  );
}