
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DownloadFileUploaderProps {
  onFileUploaded: () => void;
}

export function DownloadFileUploader({ onFileUploaded }: DownloadFileUploaderProps) {
  const [showUpload, setShowUpload] = useState(false);

  const handleUploadSuccess = async (name: string, url: string) => {
    try {
      // Use the uploaded filename as the display name
      const filename = url.split('/').pop() || name;
      
      const { error } = await supabase.from("downloads").insert({
        name: filename,
        url,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (error) throw error;
      
      onFileUploaded();
      setShowUpload(false);
      toast.success("Plik został dodany");
    } catch (error) {
      console.error("Error saving file metadata:", error);
      toast.error("Nie udało się zapisać informacji o pliku");
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowUpload(!showUpload)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {showUpload ? "Anuluj" : "Dodaj plik"}
      </Button>

      {showUpload && (
        <div className="mb-8">
          <FileUpload
            bucket="downloads"
            onSuccess={handleUploadSuccess}
            acceptedFileTypes="*/*"
            uploadId="downloads-main"
          />
        </div>
      )}
    </div>
  );
}
