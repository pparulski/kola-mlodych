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

    // Create an image with fixed dimensions
    const targetWidth = 600 // Fixed width
    const targetHeight = Math.ceil((height * targetWidth) / width) // Maintain aspect ratio
    
    console.log('Target dimensions calculated:', targetWidth, targetHeight)

    // Create image with minimum dimensions of 1x1
    const imageWidth = Math.max(1, targetWidth)
    const imageHeight = Math.max(1, targetHeight)
    
    console.log('Final image dimensions:', imageWidth, imageHeight)

    const image = new Image(imageWidth, imageHeight)
    
    // Fill with white background
    image.fill(0xFFFFFFFF)
    
    console.log('Background filled, creating pattern')

    // Create a pattern with larger spacing and safer bounds checking
    const gridSize = 50 // Increased spacing between elements
    const rectSize = 30 // Larger rectangles for better visibility

    // Calculate number of complete rectangles that will fit
    const numRows = Math.floor(imageHeight / gridSize)
    const numCols = Math.floor(imageWidth / gridSize)

    console.log(`Creating pattern grid: ${numRows} rows x ${numCols} columns`)

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const startX = col * gridSize
        const startY = row * gridSize

        // Only draw rectangle if we have enough space
        if (startX + rectSize <= imageWidth && startY + rectSize <= imageHeight) {
          // Draw filled rectangle
          for (let y = 0; y < rectSize; y++) {
            for (let x = 0; x < rectSize; x++) {
              const px = startX + x
              const py = startY + y
              if (px >= 0 && px < imageWidth && py >= 0 && py < imageHeight) {
                image.setPixelAt(px, py, 0x000000FF)
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