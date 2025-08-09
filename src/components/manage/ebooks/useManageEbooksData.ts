
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Ebook } from "@/components/ebooks/types";
import { toast } from "sonner";

export function useManageEbooksData() {
  const [ebookToEdit, setEbookToEdit] = useState<Ebook | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(true);

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

  const handleEdit = (ebook: Ebook) => {
    setEbookToEdit(ebook);
    setIsAddingNew(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEbookToEdit(null);
    setIsAddingNew(true);
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
      if (id) {
        // Update existing ebook
        console.log("Updating ebook with ID:", id);
        console.log("Update data:", {
          title,
          file_url,
          cover_url,
          ebook_type,
          description,
          page_count,
        });

        const { error } = await supabase.from('ebooks').update({
          title,
          file_url,
          cover_url,
          ebook_type,
          description,
          page_count,
        }).eq('id', id);

        if (error) throw error;
        toast.success("Publikacja zaktualizowana pomyślnie");
      } else {
        // Add new ebook with a stable unique slug
        const { generateUniqueEbookSlug } = await import("@/utils/ebooksSlug");
        const slug = await generateUniqueEbookSlug(title);
        const { error } = await supabase.from('ebooks').insert({
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
        toast.success("Publikacja dodana pomyślnie");
      }
      
      refetch();
      // Reset form state after any submission (new or edit)
      setEbookToEdit(null);
      setIsAddingNew(true);
    } catch (error) {
      console.error('Error saving ebook:', error);
      toast.error("Nie udało się zapisać publikacji");
    }
  };

  return {
    ebooks,
    isLoading,
    ebookToEdit,
    isAddingNew,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleDelete
  };
}
