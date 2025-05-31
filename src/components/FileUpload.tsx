
import { useState } from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeFilename } from "@/lib/utils";
import imageCompression from 'browser-image-compression';

interface FileUploadProps {
  onSuccess?: (name: string, url: string) => void;
  bucket?: "downloads" | "ebooks" | "news_images" | "static_pages_images";
  acceptedFileTypes?: string;
  currentValue?: string | null;
  onUpload?: (url: string) => void;
  uploadId?: string;
  compress?: boolean;
  quality?: number;
}

export function FileUpload({ 
  onSuccess, 
  bucket = "news_images", 
  acceptedFileTypes, 
  currentValue,
  onUpload,
  uploadId = "default",
  compress = true,
  quality = 80
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: quality / 100,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`Image compressed from ${file.size} bytes to ${compressedFile.size} bytes`);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original file if compression fails
    }
  };

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
      
      let originalFilename = file.name;
      // Get file extension
      const fileExt = originalFilename.split('.').pop() || '';
      const baseName = originalFilename.replace(`.${fileExt}`, '');
      
      // Create a sanitized filename that replaces Polish characters
      // and replaces spaces with underscores
      const sanitizedBaseName = sanitizeFilename(baseName);
      
      // Final filename with extension 
      const newFilename = `${sanitizedBaseName}.${fileExt}`;
      
      console.log(`Original filename: ${originalFilename}`);
      console.log(`Sanitized filename: ${newFilename}`);
      
      // Determine if we should compress (only for images and when compress is true)
      const isImage = file.type.startsWith('image/');
      let fileToUpload = file;
      
      if (compress && isImage) {
        console.log('Compressing image client-side...');
        fileToUpload = await compressImage(file);
      }

      // Direct upload to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(newFilename, fileToUpload, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      console.log("File uploaded successfully:", data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(newFilename);

      console.log("Public URL generated:", publicUrl);
      
      // Support both callback styles
      if (onSuccess) {
        onSuccess(originalFilename, publicUrl);
      }
      
      if (onUpload) {
        onUpload(publicUrl);
      }
      
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      // Clear the file input so the same file can be selected again
      const fileInput = document.getElementById(`file-${uploadId}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      {currentValue && (
        <img 
          src={currentValue} 
          alt="Preview" 
          className="h-20 w-20 object-cover rounded"
        />
      )}
      <input
        type="file"
        id={`file-${uploadId}`}
        className="hidden"
        onChange={handleFileUpload}
        accept={acceptedFileTypes}
      />
      <Button
        onClick={() => document.getElementById(`file-${uploadId}`)?.click()}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? "Wgrywam..." : "Wybierz plik"}
      </Button>
    </div>
  );
}
