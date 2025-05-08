
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EbookUploadProps {
  onUploadSuccess: (
    title: string, 
    file_url: string, 
    cover_url: string, 
    publication_year: number,
    description?: string,
    page_count?: number // Added page count parameter
  ) => Promise<void>;
}

export function EbookUpload({ onUploadSuccess }: EbookUploadProps) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [publicationYear, setPublicationYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState("");
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !fileUrl) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onUploadSuccess(title, fileUrl, coverUrl, publicationYear, description, pageCount);
      setTitle("");
      setFileUrl("");
      setCoverUrl("");
      setDescription("");
      setPageCount(undefined);
      setPublicationYear(new Date().getFullYear());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mb-8 bg-card rounded-md p-6 border border-border/50 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="title">Tytuł publikacji</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Wprowadź tytuł publikacji"
          className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Rok publikacji</Label>
          <Input
            id="year"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={publicationYear}
            onChange={(e) => setPublicationYear(parseInt(e.target.value))}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pageCount">Liczba stron</Label>
          <Input
            id="pageCount"
            type="number"
            min="1"
            value={pageCount || ''}
            onChange={(e) => setPageCount(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Wprowadź liczbę stron"
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Opis publikacji</Label>
        <Textarea
          id="description"
          placeholder="Wprowadź krótki opis publikacji..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="transition-all duration-200 focus:ring-2 focus:ring-primary/25"
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
        disabled={!title || !fileUrl || isSubmitting}
        className="w-full transition-all hover:scale-105 duration-200"
      >
        {isSubmitting ? "Dodawanie..." : "Dodaj publikację"}
      </Button>
    </div>
  );
}
