import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { pdfUrl } = await req.json()
    console.log('Generating cover for PDF:', pdfUrl)

    // Fetch the PDF file
    const response = await fetch(pdfUrl)
    const pdfBytes = await response.arrayBuffer()
    console.log('PDF file fetched successfully')

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pages = pdfDoc.getPages()
    
    if (pages.length === 0) {
      throw new Error('PDF has no pages')
    }
    
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    
    console.log('PDF first page dimensions:', width, height)

    // Create an image with fixed dimensions to ensure consistency
    const imageWidth = 600 // Fixed width
    const imageHeight = Math.floor((height * imageWidth) / width) // Maintain aspect ratio
    
    console.log('Creating image with dimensions:', imageWidth, imageHeight)
    
    // Ensure minimum dimensions
    if (imageWidth < 1 || imageHeight < 1) {
      throw new Error('Invalid image dimensions calculated')
    }

    const image = new Image(imageWidth, imageHeight)
    
    // Fill with white background
    image.fill(0xFFFFFFFF) // White color
    
    console.log('Background filled, creating pattern')

    // Create a pattern of rectangles to represent the content
    const gridSize = 40 // Larger grid size for better visibility
    const rectSize = 20 // Larger rectangles

    for (let y = 0; y < imageHeight; y += gridSize) {
      for (let x = 0; x < imageWidth; x += gridSize) {
        // Only draw if we have enough space for the rectangle
        if (x + rectSize <= imageWidth && y + rectSize <= imageHeight) {
          // Draw a filled rectangle
          for (let dy = 0; dy < rectSize; dy++) {
            for (let dx = 0; dx < rectSize; dx++) {
              const px = x + dx
              const py = y + dy
              // Extra safety check
              if (px >= 0 && px < imageWidth && py >= 0 && py < imageHeight) {
                image.setPixelAt(px, py, 0x000000FF)
              }
            }
          }
        }
      }
    }

    console.log('Pattern created, encoding image')

    // Encode the image to PNG
    const pngBytes = await image.encode()
    console.log('Cover image generated successfully')

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate a unique filename for the cover
    const coverFileName = `${crypto.randomUUID()}-cover.png`

    // Upload the PNG to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('ebooks')
      .upload(coverFileName, pngBytes, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    console.log('Cover uploaded successfully:', coverFileName)

    // Get the public URL for the cover
    const { data: { publicUrl: coverUrl } } = supabase
      .storage
      .from('ebooks')
      .getPublicUrl(coverFileName)

    return new Response(
      JSON.stringify({ coverUrl }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error generating PDF cover:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})