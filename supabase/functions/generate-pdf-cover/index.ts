import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import pdfImgConvert from "npm:pdf-img-convert@1.2.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { pdfUrl } = await req.json();
        console.log("Generating cover for PDF:", pdfUrl);

        // Fetch PDF file
        const pdfResponse = await fetch(pdfUrl);
        if (!pdfResponse.ok) {
            throw new Error("Failed to fetch PDF");
        }

        const pdfBuffer = await pdfResponse.arrayBuffer();
        console.log("PDF fetched, size:", pdfBuffer.byteLength);

        // Convert first page to PNG
        const options = {
            page_numbers: [1],
            base64: false,
            scale: 0.5  // Reduce size of the output image
        };

        const pngPages = await pdfImgConvert.convert(new Uint8Array(pdfBuffer), options);
        console.log("PDF converted to PNG");

        if (!pngPages || pngPages.length === 0) {
            throw new Error("Failed to convert PDF to PNG");
        }

        // Initialize Supabase client
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const coverFileName = `${crypto.randomUUID()}-cover.png`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("ebooks")
            .upload(coverFileName, pngPages[0], {
                contentType: "image/png",
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        console.log("Cover uploaded successfully:", coverFileName);

        // Get public URL
        const { data: { publicUrl: coverUrl } } = supabase.storage
            .from("ebooks")
            .getPublicUrl(coverFileName);

        return new Response(JSON.stringify({ coverUrl }), {
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error generating PDF cover:", error);
        return new Response(
            JSON.stringify({
                error: error.message,
                details: error.stack,
            }),
            {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
                status: 500,
            }
        );
    }
});