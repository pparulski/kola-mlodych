import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

export function ManageDownloads() {
  const [name, setName] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const { data: downloads, isLoading } = useQuery({
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
    if (!name || !fileUrl) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase.from('downloads').insert({
        name,
        url: fileUrl,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;

      toast.success("File added successfully");
      setName("");
      setFileUrl("");
    } catch (error) {
      console.error('Error adding file:', error);
      toast.error("Failed to add file");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("File deleted successfully");
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error("Failed to delete file");
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
            <Label htmlFor="name">Nazwa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Wpisz nazwę pliku"
            />
          </div>

          <div>
            <Label>Plik</Label>
            {!fileUrl ? (
              <FileUpload
                bucket="downloads"
                onSuccess={(name, url) => setFileUrl(url)}
                acceptedFileTypes="*/*"
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

          <Button onClick={handleSubmit} disabled={!name || !fileUrl}>
            Wgraj plik
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl mb-4">Lista plików</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {downloads?.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.name}</TableCell>
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
