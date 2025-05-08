
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SortField = "name" | "created_at";
export type SortDirection = "asc" | "desc";

export interface DownloadItem {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export function useDownloadsData() {
  const [files, setFiles] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const fetchFiles = async () => {
    try {
      console.log("Fetching downloads...");
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching downloads:", error);
        toast.error("Nie udało się pobrać plików");
        return;
      }

      console.log("Downloads fetched:", data);
      setFiles(data || []);
    } catch (error) {
      console.error("Error in fetchFiles:", error);
      toast.error("Wystąpił błąd podczas pobierania plików");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const fileToDelete = files.find(file => file.id === id);
      if (!fileToDelete) return;

      const filename = fileToDelete.url.split('/').pop();
      
      if (filename) {
        const { error: storageError } = await supabase.storage
          .from('downloads')
          .remove([filename]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          throw storageError;
        }
      }

      const { error: dbError } = await supabase
        .from("downloads")
        .delete()
        .eq("id", id);

      if (dbError) {
        console.error("Error deleting file from database:", dbError);
        throw dbError;
      }

      toast.success("Plik został usunięty");
      fetchFiles();
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("Wystąpił błąd podczas usuwania pliku");
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking on same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, set default direction
      setSortField(field);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return {
    files,
    isLoading,
    sortField,
    sortDirection,
    handleDelete,
    handleSort,
    fetchFiles
  };
}
