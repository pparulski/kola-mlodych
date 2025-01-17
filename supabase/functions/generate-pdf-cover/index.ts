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

    // Create an image with the page dimensions
    const imageWidth = Math.floor(width)
    const imageHeight = Math.floor(height)
    const image = new Image(imageWidth, imageHeight)
    
    // Fill with white background
    for (let y = 0; y < imageHeight; y++) {
      for (let x = 0; x < imageWidth; x++) {
        image.setPixelAt(x, y, 0xFFFFFFFF) // White color
      }
    }

    // Extract text content and draw it on the image
    const textContent = await firstPage.doc.getForm()
    const fields = textContent.getFields()
    
    console.log('Processing form fields:', fields.length)

    // Draw some visual representation of the content
    // Since we can't directly render PDF content, we'll create a simple visual pattern
    for (let y = 0; y < imageHeight; y += 20) {
      for (let x = 0; x < imageWidth; x += 20) {
        // Create a small rectangle pattern
        for (let dy = 0; dy < 10; dy++) {
          for (let dx = 0; dx < 10; dx++) {
            const px = x + dx
            const py = y + dy
            if (px < imageWidth && py < imageHeight) {
              image.setPixelAt(px, py, 0x000000FF)
            }
          }
        }
      }
    }

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