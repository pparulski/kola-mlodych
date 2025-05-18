
// This edge function compresses images, converts them to WebP format,
// and uploads them to the appropriate Supabase storage bucket
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts'
import { Buffer } from 'https://deno.land/std@0.177.0/node/buffer.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

// We need to use the service role key to bypass RLS policies
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to calculate image complexity (used for dynamic quality)
function calculateImageComplexity(image: Image): number {
  // Sample pixels to analyze image complexity (edge detection)
  const width = image.width;
  const height = image.height;
  
  // Skip pixels for performance (sample every N pixels)
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 100));
  let edgeCount = 0;
  let sampleCount = 0;
  
  // Simple edge detection by checking color differences between adjacent pixels
  for (let y = 0; y < height - sampleStep; y += sampleStep) {
    for (let x = 0; x < width - sampleStep; x += sampleStep) {
      const pixel1 = image.getPixelAt(x, y);
      const pixel2 = image.getPixelAt(x + sampleStep, y);
      const pixel3 = image.getPixelAt(x, y + sampleStep);
      
      // Calculate color differences (simple edge detection)
      const diffX = Math.abs(((pixel1 >> 16) & 0xFF) - ((pixel2 >> 16) & 0xFF)) +
                     Math.abs(((pixel1 >> 8) & 0xFF) - ((pixel2 >> 8) & 0xFF)) +
                     Math.abs((pixel1 & 0xFF) - (pixel2 & 0xFF));
      
      const diffY = Math.abs(((pixel1 >> 16) & 0xFF) - ((pixel3 >> 16) & 0xFF)) +
                     Math.abs(((pixel1 >> 8) & 0xFF) - ((pixel3 >> 8) & 0xFF)) +
                     Math.abs((pixel1 & 0xFF) - (pixel3 & 0xFF));
      
      // Count significant edges
      if (diffX > 30 || diffY > 30) {
        edgeCount++;
      }
      sampleCount++;
    }
  }
  
  // Return normalized complexity score (0-1)
  return sampleCount > 0 ? edgeCount / sampleCount : 0;
}

// Determine dynamic quality based on image content and size
function getDynamicQuality(image: Image, fileSize: number): number {
  // Base quality depends on file size
  let baseQuality: number;
  const fileSizeMB = fileSize / (1024 * 1024);
  
  if (fileSizeMB > 5) {
    baseQuality = 70; // Lower quality for very large files
  } else if (fileSizeMB > 2) {
    baseQuality = 75; // Medium-low quality for large files
  } else if (fileSizeMB > 1) {
    baseQuality = 80; // Medium quality for medium files
  } else {
    baseQuality = 85; // Higher quality for small files
  }
  
  // Adjust based on image complexity
  const complexity = calculateImageComplexity(image);
  console.log(`Image complexity score: ${complexity.toFixed(4)} (0-1 scale)`);
  
  // Higher complexity images need higher quality to maintain details
  const qualityAdjustment = Math.round(complexity * 15);
  const finalQuality = Math.min(92, Math.max(65, baseQuality + qualityAdjustment));
  
  console.log(`Dynamic quality calculation: ${finalQuality}% (base: ${baseQuality}%, adjustment: ${qualityAdjustment}%)`);
  return finalQuality;
}

// Serve function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Extract request data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucketName = formData.get('bucket') as string
    const uploadId = formData.get('uploadId') as string
    const userQuality = Number(formData.get('quality') || '80') // Default quality 80%

    if (!file || !bucketName) {
      return new Response(
        JSON.stringify({ error: 'File and bucket name are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Processing image upload: ${file.name} for bucket: ${bucketName}`)
    const fileSize = file.size;
    console.log(`Original file size: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)}MB)`)
    
    // Process file name regardless of whether we compress
    const originalFilename = file.name
    const filenameParts = originalFilename.split('.')
    const extension = filenameParts.pop()?.toLowerCase()
    const baseFilename = filenameParts.join('.')
    
    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer()
    
    // Load the image with ImageScript
    try {
      const image = await Image.decode(new Uint8Array(fileBuffer))
      console.log(`Image loaded: ${image.width}x${image.height}`)
      
      // Choose output format based on input format and size
      const isJpeg = extension === 'jpg' || extension === 'jpeg';
      const isPng = extension === 'png';
      const isWebP = extension === 'webp';
      
      let outputFilename, processedImageBuffer;
      let processedImage = image;
      
      // Apply resizing if necessary (for large images)
      const needsResize = image.width > 1920 || image.height > 1080;
      
      if (needsResize) {
        // Calculate new dimensions while maintaining aspect ratio
        const aspectRatio = image.width / image.height
        let newWidth = 1920
        let newHeight = Math.round(newWidth / aspectRatio)
        
        if (newHeight > 1080) {
          newHeight = 1080
          newWidth = Math.round(newHeight * aspectRatio)
        }
        
        processedImage = await image.resize(newWidth, newHeight)
        console.log(`Image resized to: ${newWidth}x${newHeight}`)
      }

      // Calculate dynamic quality based on image content and size
      // This overrides the user-provided quality if it exists
      const dynamicQuality = getDynamicQuality(processedImage, fileSize);
      
      // For JPEG formats, try both WebP and JPEG compression to choose the smaller one
      if (isJpeg) {
        // WebP compression with dynamic quality
        const webpQuality = dynamicQuality / 100;
        const webpBuffer = await processedImage.encode(Image.WebP, webpQuality);
        
        // JPEG compression with slightly higher quality (JPEG needs higher quality to match WebP)
        const jpegQuality = Math.min(dynamicQuality + 5, 95) / 100;
        const jpegBuffer = await processedImage.encode(Image.JPEG, jpegQuality);
        
        // Compare sizes of both formats
        console.log(`WebP size: ${webpBuffer.byteLength} bytes, JPEG size: ${jpegBuffer.byteLength} bytes`);
        
        // Use the smaller of the two formats
        if (webpBuffer.byteLength <= jpegBuffer.byteLength) {
          processedImageBuffer = webpBuffer;
          outputFilename = `${baseFilename}.webp`;
          console.log('Using WebP format (smaller)');
        } else {
          processedImageBuffer = jpegBuffer;
          outputFilename = `${baseFilename}.jpg`;
          console.log('Using JPEG format (smaller)');
        }
      } 
      // For PNG and other formats, use WebP if it's smaller
      else if (isPng) {
        // Try both WebP and PNG
        const webpQuality = dynamicQuality / 100;
        const webpBuffer = await processedImage.encode(Image.WebP, webpQuality);
        const pngBuffer = await processedImage.encode(Image.PNG);
        
        console.log(`WebP size: ${webpBuffer.byteLength} bytes, PNG size: ${pngBuffer.byteLength} bytes`);
        
        if (webpBuffer.byteLength <= pngBuffer.byteLength) {
          processedImageBuffer = webpBuffer;
          outputFilename = `${baseFilename}.webp`;
          console.log('Using WebP format (smaller than PNG)');
        } else {
          processedImageBuffer = pngBuffer;
          outputFilename = `${baseFilename}.png`;
          console.log('Using PNG format (smaller)');
        }
      }
      // For WebP input, re-encode with our quality settings
      else if (isWebP) {
        const webpQuality = dynamicQuality / 100;
        processedImageBuffer = await processedImage.encode(Image.WebP, webpQuality);
        outputFilename = `${baseFilename}.webp`;
        console.log('Re-encoding WebP with dynamic quality');
      }
      // For all other formats, default to WebP
      else {
        const webpQuality = dynamicQuality / 100;
        processedImageBuffer = await processedImage.encode(Image.WebP, webpQuality);
        outputFilename = `${baseFilename}.webp`;
        console.log('Converting unknown format to WebP');
      }
      
      // Final check to make sure we're actually saving space
      if (processedImageBuffer.byteLength >= fileSize && !needsResize) {
        console.log(`Compressed size ${processedImageBuffer.byteLength} bytes is larger than original ${fileSize} bytes. Using original file.`);
        
        // Upload original file instead
        const { data: storageData, error: storageError } = await supabase
          .storage
          .from(bucketName)
          .upload(originalFilename, fileBuffer, {
            contentType: file.type,
            upsert: true
          })

        if (storageError) {
          console.error(`Storage error: ${JSON.stringify(storageError)}`)
          throw storageError
        }

        // Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(originalFilename)
          
        console.log(`Original file uploaded (compression did not reduce size): ${publicUrl}`)
        
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
        )
      }
      
      console.log(`Compressed image size: ${processedImageBuffer.byteLength} bytes (${(processedImageBuffer.byteLength / 1024 / 1024).toFixed(2)}MB)`)
      
      // Fix: Correctly calculate compression ratio (original / new)
      const compressionRatio = (fileSize / processedImageBuffer.byteLength * 100).toFixed(2);
      console.log(`Compression ratio: ${compressionRatio}% (${fileSize} / ${processedImageBuffer.byteLength})`)

      // Upload to Supabase Storage using service role key to bypass RLS
      const contentType = outputFilename.endsWith('.webp') ? 'image/webp' : 
                          outputFilename.endsWith('.jpg') || outputFilename.endsWith('.jpeg') ? 'image/jpeg' :
                          outputFilename.endsWith('.png') ? 'image/png' : file.type;
      
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from(bucketName)
        .upload(outputFilename, processedImageBuffer, {
          contentType: contentType,
          upsert: true
        })

      if (storageError) {
        console.error(`Storage error: ${JSON.stringify(storageError)}`)
        throw storageError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(outputFilename)
        
      console.log(`File uploaded successfully: ${publicUrl}`)

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
      )
    } catch (imageError) {
      console.error(`Error processing image: ${imageError.message}`);
      
      // If image processing fails, upload the original file
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from(bucketName)
        .upload(originalFilename, fileBuffer, {
          contentType: file.type,
          upsert: true
        })

      if (storageError) {
        console.error(`Storage error: ${JSON.stringify(storageError)}`)
        throw storageError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(originalFilename)
        
      console.log(`Original file uploaded as fallback: ${publicUrl}`)
      
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
      )
    }
  } catch (error) {
    console.error(`Error processing image: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
