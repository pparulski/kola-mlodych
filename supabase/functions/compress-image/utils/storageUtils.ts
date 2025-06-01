
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

// We need to use the service role key to bypass RLS policies
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function uploadToStorage(
  bucketName: string,
  filename: string,
  buffer: Uint8Array,
  contentType: string
): Promise<string> {
  try {
    // Upload to Supabase Storage using service role key to bypass RLS
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from(bucketName)
      .upload(filename, buffer, {
        contentType: contentType,
        upsert: true
      });

    if (storageError) {
      console.error(`Storage error: ${JSON.stringify(storageError)}`);
      throw storageError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filename);
      
    console.log(`File uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading to storage: ${error.message}`);
    throw error;
  }
}

export function getContentTypeFromFilename(filename: string): string {
  if (filename.endsWith('.webp')) return 'image/webp';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream'; // Default content type
}
