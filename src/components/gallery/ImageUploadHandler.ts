
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
    let filename = blobInfo.filename();
    
    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9 ._-]/g, '');
    
    // Add unique timestamp if needed
    const timestamp = new Date().getTime();
    const fileExt = filename.split('.').pop();
    const baseName = filename.replace(`.${fileExt}`, '');
    
    // Only add timestamp if there are sanitized characters or always to ensure uniqueness
    filename = `${baseName}_${timestamp}.${fileExt}`;
    
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
      const filename = `editor_${new Date().getTime()}_${blobInfo.filename()}`;
      
      progress(40);
      
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }
      
      progress(90);

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);
      
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
