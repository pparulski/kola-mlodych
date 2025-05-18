
// This edge function compresses images, converts them to WebP format,
// and uploads them to the appropriate Supabase storage bucket
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts';
import { corsHeaders } from './utils/corsHeaders.ts';
import { processImage } from './utils/imageProcessing.ts';
import { supabase, uploadToStorage, getContentTypeFromFilename } from './utils/storageUtils.ts';

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
    
    // Process file name
    const originalFilename = file.name;
    
    // Read file as ArrayBuffer and convert to Uint8Array
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    
    try {
      // Process the image
      const { buffer: processedImageBuffer, filename: outputFilename } = await processImage(
        fileBuffer, 
        originalFilename, 
        fileSize
      );
      
      // Final check to make sure we're actually saving space
      if (processedImageBuffer.byteLength >= fileSize) {
        console.log(`Compressed size ${processedImageBuffer.byteLength} bytes is larger than original ${fileSize} bytes. Using original file.`);
        
        // Upload original file instead
        const publicUrl = await uploadToStorage(
          bucketName,
          originalFilename,
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

      // Return success response with the same format as the original upload
      return new Response(
        JSON.stringify({
          success: true,
          uploadId,
          name: outputFilename, 
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
        originalFilename,
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
