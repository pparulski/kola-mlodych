
import { useState } from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FileUploadProps {
  onSuccess: (name: string, url: string) => void;
  bucket: "downloads" | "ebooks" | "news_images" | "static_pages_images";
  acceptedFileTypes?: string;
}

export function FileUpload({ onSuccess, bucket, acceptedFileTypes }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type based on acceptedFileTypes prop
    if (acceptedFileTypes === ".pdf" && !file.type.includes("pdf")) {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (acceptedFileTypes === "image/*" && !file.type.includes("image")) {
      toast.error("Only image files are allowed");
      return;
    }

    setIsUploading(true);
    try {
      console.log(`Uploading file to ${bucket} bucket:`, file.name);
      
      // Upload file to storage using original filename
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(file.name, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      console.log("File uploaded successfully:", data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(file.name);

      console.log("Public URL generated:", publicUrl);
      
      onSuccess(file.name, publicUrl);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        id="file"
        className="hidden"
        onChange={handleFileUpload}
        accept={acceptedFileTypes}
      />
      <Button
        onClick={() => document.getElementById("file")?.click()}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>
    </div>
  );
}
