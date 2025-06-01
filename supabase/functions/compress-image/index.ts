
// This edge function compresses images, converts them to WebP format,
// and uploads them to the appropriate Supabase storage bucket
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts';
import { corsHeaders } from './utils/corsHeaders.ts';
import { processImage } from './utils/imageProcessing.ts';
import { supabase, uploadToStorage, getContentTypeFromFilename } from './utils/storageUtils.ts';

// Simple function to sanitize filenames by replacing Polish characters
function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  
  // Define character mapping for Polish characters
  const polishChars: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  };
  
  // Replace Polish characters
  let sanitized = filename;
  for (const [polish, latin] of Object.entries(polishChars)) {
    sanitized = sanitized.replace(new RegExp(polish, 'g'), latin);
  }
  
  return sanitized;
}

// Serve function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Extract request data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucketName = formData.get('bucket') as string;
    const uploadId = formData.get('uploadId') as string;
    const userQuality = Number(formData.get('quality') || '80'); // Default quality 80%
    const originalFilename = formData.get('originalFilename') as string || file.name;
    let sanitizedFilename = formData.get('sanitizedFilename') as string;

    if (!file || !bucketName) {
      return new Response(
        JSON.stringify({ error: 'File and bucket name are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing image upload: ${file.name} for bucket: ${bucketName}`);
    const fileSize = file.size;
    console.log(`Original file size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
    
    // Process file name if sanitizedFilename not provided
    if (!sanitizedFilename) {
      // Get file extension
      const fileExt = originalFilename.split('.').pop() || '';
      const baseName = originalFilename.replace(`.${fileExt}`, '');
      
      // Create a sanitized filename that replaces Polish characters
      // and replaces spaces with underscores
      const sanitizedBaseName = sanitizeFilename(baseName);
      
      // Replace spaces with underscores and remove problematic chars
      const cleanedBaseName = sanitizedBaseName
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[\/\\:*?"<>|#%&{}+`'=@$^!]/g, '_'); // Replace invalid filename chars
        
      sanitizedFilename = `${cleanedBaseName}.${fileExt}`;
    }
    
    // Read file as ArrayBuffer and convert to Uint8Array
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    
    try {
      // Process the image
      const { buffer: processedImageBuffer, filename: outputFilename } = await processImage(
        fileBuffer, 
        sanitizedFilename,  // Use sanitized filename
        fileSize
      );
      
      // Ensure we have a valid buffer size for comparison
      const processedSize = processedImageBuffer.byteLength;
      
      // Final check to make sure we're actually saving space
      if (processedSize >= fileSize) {
        console.log(`Compressed size ${processedSize} bytes is larger than original ${fileSize} bytes. Using original file.`);
        
        // Upload original file instead
        const publicUrl = await uploadToStorage(
          bucketName,
          sanitizedFilename,  // Use sanitized filename
          fileBuffer,
          file.type
        );
          
        console.log(`Original file uploaded (compression did not reduce size): ${publicUrl}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            uploadId,
            name: originalFilename, 
            url: publicUrl
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      // Upload processed image
      const contentType = getContentTypeFromFilename(outputFilename);
      const publicUrl = await uploadToStorage(
        bucketName,
        outputFilename,
        processedImageBuffer,
        contentType
      );

      // Log actual compression results
      const compressionRatio = (fileSize / processedSize).toFixed(2);
      console.log(`Actual compression ratio: ${compressionRatio}x (${fileSize} / ${processedSize} bytes)`);
      console.log(`Size reduction: ${(fileSize - processedSize) / 1024} KB (${(100 - (processedSize / fileSize) * 100).toFixed(1)}%)`);

      // Return success response with the same format as the original upload
      return new Response(
        JSON.stringify({
          success: true,
          uploadId,
          name: originalFilename, 
          url: publicUrl
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (imageError) {
      console.error(`Error processing image: ${imageError.message}`);
      
      // If image processing fails, upload the original file
      const publicUrl = await uploadToStorage(
        bucketName,
        sanitizedFilename,  // Use sanitized filename
        fileBuffer,
        file.type
      );
      
      console.log(`Original file uploaded as fallback: ${publicUrl}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          uploadId,
          name: originalFilename, 
          url: publicUrl
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error(`Error processing image: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
