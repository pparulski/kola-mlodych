import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      const { error } = await supabase
        .from("downloads")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting file:", error);
        toast.error("Nie udało się usunąć pliku");
        return;
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
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Pliki do pobrania</h1>
        {adminMode && (
          <Button onClick={() => setShowUpload(!showUpload)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {showUpload ? "Cancel" : "Dodaj plik"}
          </Button>
        )}
      </div>

      {showUpload && adminMode && (
        <div className="mb-8">
          <FileUpload
            bucket="downloads"
            onSuccess={handleUploadSuccess}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {files.map((file) => (
          <Card key={file.id}>
            <CardHeader>
              <CardTitle className="text-lg">{file.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dodano: {new Date(file.created_at).toLocaleDateString("pl-PL")}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Pobierz
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
            </CardFooter>
          </Card>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          Brak plików do pobrania
        </div>
      )}
    </div>
  );
};

export default Downloads;