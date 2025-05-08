
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDownloadsData } from "@/hooks/useDownloadsData";
import { DownloadFilesTable } from "@/components/downloads/DownloadFilesTable";

export function ManageDownloads() {
  const [fileUrl, setFileUrl] = useState("");
  const {
    files,
    isLoading,
    sortField,
    sortDirection,
    handleDelete,
    handleSort,
    fetchFiles
  } = useDownloadsData();

  const handleSubmit = async () => {
    if (!fileUrl) {
      toast.error("Proszę wybrać plik do wgrania");
      return;
    }

    try {
      // Get the filename from the URL
      const filename = fileUrl.split('/').pop() || "file";
      
      const { error } = await supabase.from('downloads').insert({
        name: filename,
        url: fileUrl,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast.success("Plik dodany pomyślnie");
      setFileUrl("");
      fetchFiles();
    } catch (error) {
      console.error('Error adding file:', error);
      toast.error("Nie udało się dodać pliku");
    }
  };

  if (isLoading) {
    return <div>Wczytywanie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Zarządzaj plikami</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl">Umieść nowy plik</h2>
        <div className="space-y-4">
          <div>
            {!fileUrl ? (
              <FileUpload
                bucket="downloads"
                onSuccess={(name, url) => setFileUrl(url)}
                acceptedFileTypes="*/*"
                uploadId="downloads-manage"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Plik został wgrany</span>
                <Button variant="outline" size="sm" onClick={() => setFileUrl("")}>
                  Zmień plik
                </Button>
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={!fileUrl}>
            Wgraj plik
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl mb-4">Lista plików</h2>
        <DownloadFilesTable
          files={files}
          adminMode={true}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
