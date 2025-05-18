// This edge function compresses images, converts them to WebP format,
// and uploads them to the appropriate Supabase storage bucket
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { Sharp } from 'https://esm.sh/sharp@0.32.6'
import { Buffer } from 'https://deno.land/std@0.177.0/node/buffer.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const quality = Number(formData.get('quality') || '80') // Default quality 80%

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

    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer()
    
    // Process image with Sharp
    const originalFilename = file.name
    const filenameParts = originalFilename.split('.')
    const extension = filenameParts.pop()?.toLowerCase()
    const baseFilename = filenameParts.join('.')
    const newFilename = `${baseFilename}.webp`

    // Create Sharp instance and process image
    const sharpInstance = new Sharp(Buffer.from(fileBuffer))
    
    // Get image metadata
    const metadata = await sharpInstance.metadata()
    console.log(`Image metadata: ${JSON.stringify(metadata)}`)
    
    // Process image based on size
    let processedImageBuffer
    
    // Apply appropriate compression based on image dimensions
    if (metadata.width && metadata.height) {
      if (metadata.width > 1920 || metadata.height > 1080) {
        // Resize large images while maintaining aspect ratio
        processedImageBuffer = await sharpInstance
          .resize({ 
            width: 1920,
            height: 1080,
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality })
          .toBuffer()
      } else {
        // Keep original dimensions but convert to WebP
        processedImageBuffer = await sharpInstance
          .webp({ quality })
          .toBuffer()
      }
    } else {
      // Fallback if we can't get dimensions
      processedImageBuffer = await sharpInstance
        .webp({ quality })
        .toBuffer()
    }
    
    console.log(`Compressed image size: ${processedImageBuffer.byteLength} bytes`)

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from(bucketName)
      .upload(newFilename, processedImageBuffer, {
        contentType: 'image/webp',
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
      .getPublicUrl(newFilename)
      
    console.log(`File uploaded successfully: ${publicUrl}`)

    // Return success response with the same format as the original upload
    return new Response(
      JSON.stringify({
        success: true,
        uploadId,
        name: newFilename, 
        url: publicUrl
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
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
