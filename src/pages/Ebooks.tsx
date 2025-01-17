import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EbookCard } from "@/components/ebooks/EbookCard";
import { EbookUpload } from "@/components/ebooks/EbookUpload";

interface Ebook {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  created_at: string;
}

interface EbooksProps {
  adminMode?: boolean;
}

export default function Ebooks({ adminMode = false }: EbooksProps) {
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

      toast.success("Ebook został usunięty");
      fetchEbooks();
    } catch (error) {
      console.error("Error deleting ebook:", error);
      toast.error("Failed to delete ebook");
    }
  };

  const handleUploadSuccess = async (title: string, file_url: string) => {
    try {
      console.log("Generating cover for PDF:", file_url);
      
      const { data: { coverUrl }, error: functionError } = await supabase.functions
        .invoke('generate-pdf-cover', {
          body: { pdfUrl: file_url }
        });

      if (functionError) {
        console.error("Error generating cover:", functionError);
        throw new Error('Failed to generate cover');
      }

      console.log("Cover generated successfully:", coverUrl);

      console.log("Saving ebook metadata:", { title, file_url, coverUrl });
      const { error } = await supabase.from("ebooks").insert({
        title,
        file_url,
        cover_url: coverUrl,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      
      toast.success("Ebook został dodany");
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
        <EbookUpload onUploadSuccess={handleUploadSuccess} />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ebooks.map((ebook) => (
          <EbookCard
            key={ebook.id}
            ebook={ebook}
            onDelete={handleDelete}
            adminMode={adminMode}
          />
        ))}
      </div>

      {ebooks.length === 0 && (
        <div className="text-center text-muted-foreground mt-8">
          Brak ebooków
        </div>
      )}
    </div>
  );
}