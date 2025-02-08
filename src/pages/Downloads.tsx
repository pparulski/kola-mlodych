
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";

interface DownloadItem {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface DownloadsProps {
  adminMode?: boolean;
}

const Downloads = ({ adminMode = false }: DownloadsProps) => {
  const [files, setFiles] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

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
      // Find the file to get its URL before deletion
      const fileToDelete = files.find(file => file.id === id);
      if (!fileToDelete) return;

      // Extract filename from URL
      const filename = fileToDelete.url.split('/').pop();
      
      if (filename) {
        // Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from('downloads')
          .remove([filename]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          throw storageError;
        }
      }

      // Delete the database record
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

  const handleUploadSuccess = async (name: string, url: string) => {
    try {
      const { error } = await supabase.from("downloads").insert({
        name,
        url,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      
      fetchFiles();
      setShowUpload(false);
    } catch (error) {
      console.error("Error saving file metadata:", error);
      toast.error("Failed to save file information");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg text-foreground">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {adminMode && (
        <Button onClick={() => setShowUpload(!showUpload)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {showUpload ? "Anuluj" : "Dodaj plik"}
        </Button>
      )}

      {showUpload && adminMode && (
        <div className="mb-8">
          <FileUpload
            bucket="downloads"
            onSuccess={handleUploadSuccess}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader className="bg-secondary">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white hover:bg-transparent">Nazwa pliku</TableHead>
              <TableHead className="text-white hover:bg-transparent">Data dodania</TableHead>
              <TableHead className="text-white hover:bg-transparent">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-background">
            {files.map((file) => (
              <TableRow key={file.id} className="hover:bg-transparent">
                <TableCell>{file.name}</TableCell>
                <TableCell>
                  {new Date(file.created_at).toLocaleDateString("pl-PL")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2 flex-wrap">
                    <Button variant="outline" asChild size="sm">
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Pobierz</span>
                      </a>
                    </Button>
                    {adminMode && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {files.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          Brak plików do pobrania
        </div>
      )}
    </div>
  );
}

export default Downloads;
