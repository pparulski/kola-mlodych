import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EbookCard } from "@/components/ebooks/EbookCard";
import { EbookUpload } from "@/components/ebooks/EbookUpload";

interface Ebook {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  created_at: string;
  publication_year?: number;
}

interface EbooksProps {
  adminMode?: boolean;
}

export default function Ebooks({ adminMode = false }: EbooksProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      console.log("Fetching publikacje...");
      const { data, error } = await supabase
        .from("ebooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Publikacje fetched:", data);
      setEbooks(data || []);
    } catch (error) {
      console.error("Error fetching publikacje:", error);
      toast.error("Nie udało się pobrać publikacji");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Find the ebook to get its URLs before deletion
      const ebookToDelete = ebooks.find(ebook => ebook.id === id);
      if (!ebookToDelete) return;

      // Extract filenames from URLs
      const pdfFilename = ebookToDelete.file_url.split('/').pop();
      const coverFilename = ebookToDelete.cover_url?.split('/').pop();

      console.log("Deleting publication files:", { pdfFilename, coverFilename });

      // Delete the PDF file from storage
      if (pdfFilename) {
        const { error: pdfDeleteError } = await supabase.storage
          .from('ebooks')
          .remove([pdfFilename]);
        
        if (pdfDeleteError) {
          console.error("Error deleting PDF file:", pdfDeleteError);
          throw pdfDeleteError;
        }
      }

      // Delete the cover image if it exists
      if (coverFilename) {
        const { error: coverDeleteError } = await supabase.storage
          .from('ebooks')
          .remove([coverFilename]);
        
        if (coverDeleteError) {
          console.error("Error deleting cover image:", coverDeleteError);
          throw coverDeleteError;
        }
      }

      // Delete the database record
      const { error: dbDeleteError } = await supabase
        .from("ebooks")
        .delete()
        .eq("id", id);

      if (dbDeleteError) throw dbDeleteError;

      toast.success("Publikacja została usunięta");
      fetchEbooks();
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast.error("Nie udało się usunąć publikacji");
    }
  };

  const handleUploadSuccess = async (
    title: string, 
    file_url: string, 
    cover_url: string, 
    publication_year: number
  ) => {
    try {
      console.log("Saving publication metadata:", { 
        title, 
        file_url, 
        cover_url, 
        publication_year 
      });
      
      const { error } = await supabase.from("ebooks").insert({
        title,
        file_url,
        cover_url,
        publication_year,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      
      toast.success("Publikacja została dodana");
      fetchEbooks();
      setShowUpload(false);
    } catch (error) {
      console.error("Error saving publication metadata:", error);
      toast.error("Nie udało się zapisać informacji o publikacji");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {adminMode && (
        <Button onClick={() => setShowUpload(!showUpload)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {showUpload ? "Anuluj" : "Dodaj publikację"}
        </Button>
      )}

      {showUpload && adminMode && (
        <EbookUpload onUploadSuccess={handleUploadSuccess} />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ebooks.map((ebook) => (
          <EbookCard
            key={ebook.id}
            ebook={ebook}
            onDelete={handleDelete}
            adminMode={adminMode}
          />
        ))}
      </div>

      {ebooks.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          Brak publikacji
        </div>
      )}
    </div>
  );
}
