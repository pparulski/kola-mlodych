import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { decode } from "https://deno.land/x/pdflib@v0.1.1/mod.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

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

    // Decode the PDF
    const pdf = await decode(new Uint8Array(pdfBytes));
    if (!pdf || pdf.pages.length === 0) {
      throw new Error('Invalid PDF or no pages found');
    }

    // Get the first page
    const page = pdf.pages[0];
    
    // Create an image from the page
    const width = 612; // Standard US Letter width
    const height = 792; // Standard US Letter height
    const image = new Image(width, height);
    
    // Fill with white background
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        image.setPixelAt(x, y, 0xFFFFFFFF); // White color
      }
    }

    // Render PDF content onto the image (basic representation)
    const operations = page.operations;
    for (const op of operations) {
      if (op.operator === 'Tj' || op.operator === 'TJ') {
        // Handle text operations
        const x = Math.floor(op.transform?.[4] ?? 0);
        const y = Math.floor(height - (op.transform?.[5] ?? 0));
        if (x >= 0 && x < width && y >= 0 && y < height) {
          image.setPixelAt(x, y, 0x000000FF); // Black color for text
        }
      }
    }

    // Encode the image to PNG
    const pngBytes = await image.encode();
    console.log('Cover image generated successfully');

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