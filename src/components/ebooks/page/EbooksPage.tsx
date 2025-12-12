
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EbookUpload } from "@/components/ebooks/EbookUpload";
import { EbooksList } from "./EbooksList";
import { useEbooksData } from "./useEbooksData";
import { EbooksAlarmCarousel } from "./EbooksAlarmCarousel";
import { cn } from "@/lib/utils";

interface EbooksPageProps {
  adminMode?: boolean;
}

export function EbooksPage({ adminMode = false }: EbooksPageProps) {
  const [showUpload, setShowUpload] = useState(false);
  const { ebooks, isLoading, fetchEbooks } = useEbooksData();

  // Separate ebooks by type
  const alarmEbooks = ebooks.filter(ebook => ebook.ebook_type === "Alarm");
  const otherEbooks = ebooks.filter(ebook => ebook.ebook_type !== "Alarm");

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

  const handleSubmit = async (
    id: string | undefined,
    title: string, 
    file_url: string, 
    cover_url: string, 
    ebook_type: string,
    description?: string,
    page_count?: number
  ) => {
    try {
      console.log("Saving publication metadata:", { 
        title, 
        file_url, 
        cover_url, 
        ebook_type,
        description,
        page_count
      });
      
      // Generate a unique, stable slug for the ebook
      const { generateUniqueEbookSlug } = await import("@/utils/ebooksSlug");
      const slug = await generateUniqueEbookSlug(title);

      const { error } = await supabase.from("ebooks").insert({
        title,
        slug,
        file_url,
        cover_url,
        ebook_type,
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
    return <EbooksLoadingState />;
  }

  return (
    <div className="space-y-0 animate-fade-in">
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
        <EbookUpload 
          onSubmit={handleSubmit}
        />
      )}

      {alarmEbooks.length > 0 && (
        <div className={cn(
            "w-full"
          )}>
          <EbooksAlarmCarousel ebooks={alarmEbooks} />
        </div>
      )}

      <div>
        <EbooksList 
          ebooks={otherEbooks} 
          onDelete={adminMode ? handleDelete : undefined}
          adminMode={adminMode} 
          showType={true}
        />
      </div>
    </div>
  );
}

function EbooksLoadingState() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="text-lg animate-pulse">Ładowanie...</div>
    </div>
  );
}
