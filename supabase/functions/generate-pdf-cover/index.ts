import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib'
import * as base64 from "https://deno.land/std@0.182.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { pdfUrl } = await req.json()
    console.log('Generating cover for PDF:', pdfUrl)

    // Fetch PDF
    const response = await fetch(pdfUrl)
    if (!response.ok) {
      throw new Error('Failed to fetch PDF')
    }
    
    const pdfBytes = await response.arrayBuffer()
    if (pdfBytes.byteLength === 0) {
      throw new Error('PDF file is empty')
    }
    
    console.log('PDF file fetched successfully, size:', pdfBytes.byteLength)

    // Load PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const pages = pdfDoc.getPages()
    
    if (pages.length === 0) {
      throw new Error('PDF has no pages')
    }
    
    // Get first page
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()
    
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid PDF dimensions')
    }
    
    console.log('PDF dimensions:', { width, height })

    // Create a new PDF with just the first page
    const coverPdf = await PDFDocument.create()
    const [coverPage] = await coverPdf.copyPages(pdfDoc, [0])
    coverPdf.addPage(coverPage)

    // Convert to PNG format with specific options for better quality
    const pngBytes = await coverPdf.saveAsBase64({ 
      dataUri: true,
      format: 'png',
      quality: 100
    })
    
    // Extract the base64 data and convert to bytes
    const pngData = pngBytes.split(',')[1] // Remove data URI prefix
    const imageBytes = base64.decode(pngData)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const coverFileName = `${crypto.randomUUID()}-cover.png`

    // Upload to Supabase Storage with explicit content type
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('ebooks')
      .upload(coverFileName, imageBytes, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    console.log('Cover uploaded successfully:', coverFileName)

    // Get public URL
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
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
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