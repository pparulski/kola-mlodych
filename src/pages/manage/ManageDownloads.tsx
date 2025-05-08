
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

type SortField = "name" | "created_at";
type SortDirection = "asc" | "desc";

export function ManageDownloads() {
  const [fileUrl, setFileUrl] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const { data: downloads, isLoading, refetch } = useQuery({
    queryKey: ['downloads'],
    queryFn: async () => {
      console.log('Fetching all downloads');
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
      refetch();
    } catch (error) {
      console.error('Error adding file:', error);
      toast.error("Nie udało się dodać pliku");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Plik usunięty pomyślnie");
      refetch();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error("Nie udało się usunąć pliku");
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ArrowUp className="h-4 w-4 inline ml-1" />
      : <ArrowDown className="h-4 w-4 inline ml-1" />;
  };

  const sortedDownloads = downloads ? [...downloads].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === "asc" 
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  }) : [];

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Nazwa {getSortIcon("name")}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Data dodania {getSortIcon("created_at")}
              </TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDownloads.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.name}</TableCell>
                <TableCell>
                  {new Date(file.created_at).toLocaleDateString("pl-PL")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
