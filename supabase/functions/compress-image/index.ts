
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
    
    // Process image with ImageScript (WebP alternative for Deno)
    const originalFilename = file.name
    const filenameParts = originalFilename.split('.')
    const extension = filenameParts.pop()?.toLowerCase()
    const baseFilename = filenameParts.join('.')
    const newFilename = `${baseFilename}.webp`

    // Load the image with ImageScript
    const image = await Image.decode(new Uint8Array(fileBuffer))
    console.log(`Image loaded: ${image.width}x${image.height}`)
    
    // Resize if necessary (for large images)
    let processedImage = image
    if (image.width > 1920 || image.height > 1080) {
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
    
    // Convert to WebP format - ImageScript uses quality 0-100 scale
    const webpQuality = quality / 100
    const processedImageBuffer = await processedImage.encode(Image.WebP, webpQuality)
    
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
