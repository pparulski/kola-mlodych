import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib'

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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    // Get the first page
    const firstPage = pages[0]
    
    // Convert the page to PNG format
    const pngBytes = await firstPage.png({
      width: 612, // Standard US Letter width in points
      height: 792 // Standard US Letter height in points
    })
    
    console.log('Cover PNG generated successfully')

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