import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EbookUpload } from "@/components/ebooks/EbookUpload";
import { EbookCard } from "@/components/ebooks/EbookCard";
import { toast } from "sonner";
import { BookText } from "lucide-react";
import { Ebook } from "@/components/ebooks/types";

export function ManageEbooks() {
  const { data: ebooks, isLoading, refetch } = useQuery({
    queryKey: ['ebooks'],
    queryFn: async () => {
      console.log('Fetching all ebooks');
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleUploadSuccess = async (
    title: string,
    file_url: string,
    cover_url: string,
    publication_year: number,
    description?: string,
    page_count?: number // Added page count parameter
  ) => {
    try {
      const { error } = await supabase.from('ebooks').insert({
        title,
        file_url,
        cover_url,
        publication_year,
        description,
        page_count,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      toast.success("Publikacja dodana pomyślnie");
      refetch();
    } catch (error) {
      console.error('Error adding ebook:', error);
      toast.error("Nie udało się dodać publikacji");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Find the ebook to get its URLs before deletion
      const ebookToDelete = ebooks?.find(ebook => ebook.id === id);
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
        }
      }

      // Delete the cover image if it exists
      if (coverFilename) {
        const { error: coverDeleteError } = await supabase.storage
          .from('ebooks')
          .remove([coverFilename]);
        
        if (coverDeleteError) {
          console.error("Error deleting cover image:", coverDeleteError);
        }
      }

      // Delete the database record
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Publikacja usunięta pomyślnie");
      refetch();
    } catch (error) {
      console.error('Error deleting ebook:', error);
      toast.error("Nie udało się usunąć publikacji");
    }
  };

  if (isLoading) {
    return <div className="animate-pulse text-center py-8">Wczytywanie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <BookText className="h-7 w-7" />
        Zarządzaj publikacjami
      </h1>
      
      <div>
        <h2 className="text-xl mb-4">Dodaj nową publikację</h2>
        <EbookUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      <div>
        <h2 className="text-xl mb-4">Lista publikacji</h2>
        
        {ebooks && ebooks.length > 0 ? (
          <div className="space-y-6">
            {ebooks.map((ebook) => (
              <EbookCard
                key={ebook.id}
                ebook={ebook}
                onDelete={handleDelete}
                adminMode={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted/20 rounded-md border border-dashed">
            <BookText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Brak publikacji do wyświetlenia</p>
          </div>
        )}
      </div>
    </div>
  );
}
