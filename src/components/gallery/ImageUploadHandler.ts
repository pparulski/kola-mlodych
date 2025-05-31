
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeFilename } from "@/lib/utils";
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Editor image compressed from ${file.size} bytes to ${compressedFile.size} bytes`);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing editor image:', error);
    return file; // Return original file if compression fails
  }
};

export const imageUploadHandler = async (
  blobInfo: {
    blob: () => Blob;
    filename: () => string;
  },
  progress: (percent: number) => void
): Promise<string> => {
  const bucket = "news_images";
  
  try {
    const file = blobInfo.blob() as File;
    const originalFilename = blobInfo.filename();
    
    // Get file extension
    const fileExt = originalFilename.split('.').pop() || '';
    const baseName = originalFilename.replace(`.${fileExt}`, '');
    
    // Create a sanitized filename that replaces Polish characters
    // and replaces spaces with underscores
    const sanitizedBaseName = sanitizeFilename(baseName);
    
    // Final filename
    const newFilename = `editor_${sanitizedBaseName}.${fileExt}`;
    
    // Show starting progress
    progress(10);
    
    // Compress the image client-side
    progress(30);
    const compressedFile = await compressImage(file);
    progress(50);
    
    // Upload compressed file directly to storage
    const { error: uploadError, data } = await supabase.storage
      .from(bucket)
      .upload(newFilename, compressedFile, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }
    
    progress(90);

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(newFilename);
    
    progress(100);
    console.log("Editor image uploaded:", publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error("Error uploading image in editor:", error);
    toast.error("Failed to upload image");
    throw new Error("Image upload failed");
  }
};
