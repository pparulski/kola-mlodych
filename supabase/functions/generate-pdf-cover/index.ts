import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { fromPath } from "npm:pdf2pic@3.1.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting PDF cover generation process");
    const { pdfUrl } = await req.json();
    
    if (!pdfUrl) {
      console.error("No PDF URL provided");
      throw new Error("PDF URL is required");
    }

    console.log("Fetching PDF from URL:", pdfUrl);
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      console.error("Failed to fetch PDF:", pdfResponse.statusText);
      throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
    }

    // Convert PDF to image
    console.log("Converting PDF to image");
    const options = {
      density: 100,
      saveFilename: "page",
      savePath: "./",
      format: "png",
      width: 800,
      height: 600
    };

    const convert = fromPath(pdfUrl, options);
    const pageToConvertAsImage = 1;

    const image = await convert(pageToConvertAsImage);
    console.log("PDF converted to image:", image);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const coverFileName = `${crypto.randomUUID()}-cover.png`;
    console.log("Uploading cover image:", coverFileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("ebooks")
      .upload(coverFileName, image.base64, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    console.log("Cover uploaded successfully:", uploadData);

    // Get public URL
    const { data: { publicUrl: coverUrl } } = supabase.storage
      .from("ebooks")
      .getPublicUrl(coverFileName);

    console.log("Generated public URL:", coverUrl);

    return new Response(
      JSON.stringify({ coverUrl }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error in generate-pdf-cover function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      }
    );
  }
});
