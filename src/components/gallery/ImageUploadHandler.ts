
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const imageUploadHandler = async (
  blobInfo: {
    blob: () => Blob;
    filename: () => string;
  },
  progress: (percent: number) => void
): Promise<string> => {
  const bucket = "news_images";
  
  try {
    const file = blobInfo.blob();
    const originalFilename = blobInfo.filename();
    
    // Get file extension
    const fileExt = originalFilename.split('.').pop() || '';
    const baseName = originalFilename.replace(`.${fileExt}`, '');
    
    // Create a sanitized filename that preserves Polish characters
    // but replaces spaces with underscores and removes problematic chars
    const sanitizedBaseName = baseName
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[\/\\:*?"<>|#%&{}+`'=@$^!]/g, '_'); // Replace invalid filename chars
      
    // Add timestamp to ensure uniqueness (for storage, not display)
    const timestamp = new Date().getTime();
    const newFilename = `${sanitizedBaseName}_${timestamp}.${fileExt}`;
    
    // Show starting progress
    progress(10);
    
    // Use the compression edge function for HugeRTE uploads
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('uploadId', 'hugerte-editor');
    formData.append('quality', '80');
    
    // Get auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || '';
    
    progress(30);
    
    const response = await fetch(`https://zhxajqfwzevtrazipwlg.supabase.co/functions/v1/compress-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    progress(70);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Compression failed: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error("Failed to compress and upload file");
    }
    
    progress(100);
    console.log("Editor image uploaded:", data.url);
    
    return data.url;
  } catch (error) {
    console.error("Error uploading image in editor:", error);
    
    // Try direct upload fallback if compression fails
    try {
      const file = blobInfo.blob();
      const originalFilename = blobInfo.filename();
      
      // Get file extension
      const fileExt = originalFilename.split('.').pop() || '';
      const baseName = originalFilename.replace(`.${fileExt}`, '');
      
      // Create sanitized filename
      const sanitizedBaseName = baseName
        .replace(/\s+/g, '_')
        .replace(/[\/\\:*?"<>|#%&{}+`'=@$^!]/g, '_');
      
      const timestamp = new Date().getTime();
      const newFilename = `editor_${sanitizedBaseName}_${timestamp}.${fileExt}`;
      
      progress(40);
      
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(newFilename, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }
      
      progress(90);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(newFilename);
      
      progress(100);
      console.log("Editor direct upload fallback:", publicUrl);
      
      return publicUrl;
    } catch (fallbackError) {
      console.error("Fallback upload also failed:", fallbackError);
      toast.error("Failed to upload image");
      throw new Error("Image upload failed");
    }
  }
};
