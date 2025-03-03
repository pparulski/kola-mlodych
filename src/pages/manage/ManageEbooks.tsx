import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EbookUpload } from "@/components/ebooks/EbookUpload";
import { EbookCard } from "@/components/ebooks/EbookCard";
import { toast } from "sonner";

export function ManageEbooks() {
  const { data: ebooks, isLoading } = useQuery({
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
    publication_year: number
  ) => {
    try {
      const { error } = await supabase.from('ebooks').insert({
        title,
        file_url,
        cover_url,
        publication_year,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      toast.success("Ebook added successfully");
    } catch (error) {
      console.error('Error adding ebook:', error);
      toast.error("Failed to add ebook");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Ebook deleted successfully");
    } catch (error) {
      console.error('Error deleting ebook:', error);
      toast.error("Failed to delete ebook");
    }
  };

  if (isLoading) {
    return <div>Wczytywanie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Zarządzaj publikacjami</h1>
      
      <div>
        <h2 className="text-xl mb-4">Dodaj nową publikację</h2>
        <EbookUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      <div>
        <h2 className="text-xl mb-4">Lista publikacji</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ebooks?.map((ebook) => (
            <EbookCard
              key={ebook.id}
              ebook={ebook}
              onDelete={handleDelete}
              adminMode={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
