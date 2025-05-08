import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EbookCard } from "@/components/ebooks/EbookCard";
import { EbookUpload } from "@/components/ebooks/EbookUpload";
import { Ebook } from "@/components/ebooks/types";

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
      console.log("Fetching ebooks...");
      const { data, error } = await supabase
        .from("ebooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Ebooks fetched:", data);
      setEbooks(data || []);
    } catch (error) {
      console.error("Error fetching ebooks:", error);
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
    publication_year: number,
    description?: string,
    page_count?: number // Added page count parameter
  ) => {
    try {
      console.log("Saving publication metadata:", { 
        title, 
        file_url, 
        cover_url, 
        publication_year,
        description,
        page_count
      });
      
      const { error } = await supabase.from("ebooks").insert({
        title,
        file_url,
        cover_url,
        publication_year,
        description,
        page_count,
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
        <div className="text-lg animate-pulse">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-end">
        {adminMode && (
          <Button 
            onClick={() => setShowUpload(!showUpload)}
            className="transition-transform hover:scale-105 duration-200"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {showUpload ? "Anuluj" : "Dodaj publikację"}
          </Button>
        )}
      </div>

      {showUpload && adminMode && (
        <EbookUpload onUploadSuccess={handleUploadSuccess} />
      )}

      {ebooks.length > 0 ? (
        <div className="space-y-6">
          {ebooks.map((ebook) => (
            <EbookCard
              key={ebook.id}
              ebook={ebook}
              onDelete={handleDelete}
              adminMode={adminMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-md border border-dashed animate-fade-in">
          <BookText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Brak publikacji</h3>
          <p className="text-muted-foreground">
            {adminMode 
              ? "Kliknij przycisk 'Dodaj publikację', aby dodać nową pozycję." 
              : "W tej chwili nie ma żadnych publikacji do wyświetlenia."}
          </p>
        </div>
      )}
    </div>
  );
}
