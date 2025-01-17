import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import * as pdfjs from "https://deno.land/x/pdf@v0.1.0/mod.ts";

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

    // Parse the PDF
    const pdf = await pdfjs.getDocument(new Uint8Array(pdfBytes));
    const page = await pdf.getPage(1); // Get first page
    const viewport = page.getViewport({ scale: 1.0 });
    
    console.log('PDF page loaded, viewport:', viewport.width, viewport.height);

    // Create an image with the page dimensions
    const width = Math.floor(viewport.width);
    const height = Math.floor(viewport.height);
    const image = new Image(width, height);
    
    // Fill with white background
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        image.setPixelAt(x, y, 0xFFFFFFFF); // White color
      }
    }

    // Get the text content
    const textContent = await page.getTextContent();
    console.log('Processing text items:', textContent.items.length);

    // Draw text items on the image
    for (const item of textContent.items) {
      const x = Math.floor(item.transform[4]);
      const y = Math.floor(height - item.transform[5]); // Flip Y coordinate
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        // Draw a small rectangle for each text item
        for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              image.setPixelAt(px, py, 0x000000FF);
            }
          }
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