import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Ebook {
  id: string;
  title: string;
  file_url: string;
  created_at: string;
}

interface EbooksProps {
  adminMode?: boolean;
}

const Ebooks = ({ adminMode = false }: EbooksProps) => {
  const [showUpload, setShowUpload] = useState(false);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      console.log("Fetching ebooks...");
      const { data, error } = await supabase
        .from("ebooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Ebooks fetched:", data);
      setEbooks(data || []);
    } catch (error) {
      console.error("Error fetching ebooks:", error);
      toast.error("Failed to load ebooks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ebooks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Ebook deleted successfully");
      fetchEbooks();
    } catch (error) {
      console.error("Error deleting ebook:", error);
      toast.error("Failed to delete ebook");
    }
  };

  const handleUploadSuccess = async (title: string, file_url: string) => {
    try {
      const { error } = await supabase.from("ebooks").insert({
        title,
        file_url,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      
      fetchEbooks();
      setShowUpload(false);
    } catch (error) {
      console.error("Error saving ebook metadata:", error);
      toast.error("Failed to save ebook information");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">eBooki</h1>
        {adminMode && (
          <Button onClick={() => setShowUpload(!showUpload)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {showUpload ? "Cancel" : "Dodaj ebooka"}
          </Button>
        )}
      </div>

      {showUpload && adminMode && (
        <div className="mb-8">
          <FileUpload
            bucket="ebooks"
            onSuccess={handleUploadSuccess}
            acceptedFileTypes=".pdf"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ebooks.map((ebook) => (
          <Card key={ebook.id} className="w-[300px] h-[250px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg truncate" title={ebook.title}>
                {ebook.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Dodano: {new Date(ebook.created_at).toLocaleDateString("pl-PL")}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <a href={ebook.file_url} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Czytaj
                </a>
              </Button>
              {adminMode && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(ebook.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {ebooks.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          Brak ebooków
        </div>
      )}
    </div>
  );
};

export default Ebooks;