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

    // Set fixed dimensions with minimum values
    const baseWidth = 600
    const baseHeight = Math.ceil((height * baseWidth) / width)
    
    // Ensure minimum dimensions and handle potential NaN/Infinity
    const imageWidth = Math.max(2, Math.min(baseWidth, 1200))
    const imageHeight = Math.max(2, Math.min(baseHeight, 1200))
    
    console.log('Creating image with dimensions:', imageWidth, imageHeight)

    // Create the image with validated dimensions
    const image = new Image(imageWidth, imageHeight)
    
    // Fill with white background
    await image.fill(0xFFFFFFFF)
    
    // Create a simpler pattern with larger elements and more spacing
    const gridSize = 60 // Increased spacing
    const rectSize = 40 // Larger rectangles

    // Calculate grid dimensions
    const rows = Math.floor(imageHeight / gridSize)
    const cols = Math.floor(imageWidth / gridSize)
    
    console.log(`Creating pattern with ${rows} rows and ${cols} columns`)

    // Create checkerboard pattern
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Only draw every other rectangle for a checkerboard effect
        if ((row + col) % 2 === 0) {
          const x = col * gridSize
          const y = row * gridSize
          
          // Ensure we're within bounds
          const actualRectSize = Math.min(
            rectSize,
            imageWidth - x,
            imageHeight - y
          )
          
          if (actualRectSize > 0) {
            // Draw filled rectangle with boundary checking
            for (let dy = 0; dy < actualRectSize; dy++) {
              for (let dx = 0; dx < actualRectSize; dx++) {
                const px = x + dx
                const py = y + dy
                if (px >= 0 && px < imageWidth && py >= 0 && py < imageHeight) {
                  image.setPixelAt(px, py, 0x000000FF)
                }
              }
            }
          }
        }
      }
    }

    console.log('Pattern created successfully')

    // Encode the image to PNG
    const pngBytes = await image.encode()
    console.log('Image encoded successfully')

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