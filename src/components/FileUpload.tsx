
import { useState } from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      // Properly sanitize the filename - only allow alphanumeric characters, dots, underscores, and hyphens
      // Replace spaces with underscores for better storage compatibility
      const fileExt = originalFilename.split('.').pop() || '';
      const baseName = originalFilename.replace(`.${fileExt}`, '');
      
      // Create sanitized base name - remove any special characters
      const sanitizedBaseName = baseName
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_'); // Replace multiple underscores with a single one
        
      // Add timestamp to ensure uniqueness
      const timestamp = new Date().getTime();
      const newFilename = `${sanitizedBaseName}_${timestamp}.${fileExt}`;
      
      console.log(`Original filename: ${originalFilename}`);
      console.log(`Sanitized filename: ${newFilename}`);
      
      // Determine if we should use compression (only for images and when compress is true)
      const isImage = file.type.startsWith('image/');
      const useCompression = compress && isImage;

      let publicUrl = '';
      
      if (useCompression) {
        // Use edge function for compression
        console.log(`Using compression for ${newFilename}`);
        
        // Create form data to send to the edge function
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', bucket);
        formData.append('uploadId', uploadId);
        formData.append('quality', quality.toString());
        
        // Call the edge function - get authentication token properly
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token || '';
        
        const response = await fetch(`https://zhxajqfwzevtrazipwlg.supabase.co/functions/v1/compress-image`, {
          method: 'POST',
          body: formData,
          headers: {
            // No need for Content-Type header with FormData
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Compression failed: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Compression result:", data);
        
        if (!data.success) {
          throw new Error("Failed to compress and upload file");
        }
        
        publicUrl = data.url;
        
      } else {
        // Original direct upload to Supabase storage
        console.log(`Using direct upload for ${newFilename}`);
        const { error: uploadError, data } = await supabase.storage
          .from(bucket)
          .upload(newFilename, file, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        console.log("File uploaded successfully:", data);

        // Get public URL
        const { data: { publicUrl: directUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(newFilename);
          
        publicUrl = directUrl;
      }

      console.log("Public URL generated:", publicUrl);
      
      // Support both callback styles
      if (onSuccess) {
        onSuccess(newFilename, publicUrl);
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
