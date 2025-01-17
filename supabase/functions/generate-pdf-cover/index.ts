import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@1.17.1";

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

        // Fetch and validate PDF
        const response = await fetch(pdfUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch PDF");
        }

        const pdfBytes = await response.arrayBuffer();
        if (pdfBytes.byteLength === 0) {
            throw new Error("PDF file is empty");
        }

        console.log("PDF file fetched successfully, size:", pdfBytes.byteLength);

        // Load and validate PDF document
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        if (pages.length === 0) {
            throw new Error("PDF has no pages");
        }

        const firstPage = pages[0];

        // Render the first page to a bitmap
        const pageImage = await firstPage.convertToPng();
        const image = await Image.decode(pageImage);
        
        let { width, height } = image;

        if (width <= 0 || height <= 0) {
            throw new Error("Invalid PDF dimensions");
        }

        console.log("PDF dimensions:", { width, height });

        // Calculate image dimensions with strict validation
        const MIN_DIMENSION = 100;
        const MAX_DIMENSION = 1200;

        let imageWidth = Math.round(width);
        let imageHeight = Math.round(height);

        // Scale down if too large
        if (imageWidth > MAX_DIMENSION) {
            const scale = MAX_DIMENSION / imageWidth;
            imageWidth = MAX_DIMENSION;
            imageHeight = Math.round(imageHeight * scale);
        }

        // Ensure minimum dimensions
        imageWidth = Math.max(MIN_DIMENSION, imageWidth);
        imageHeight = Math.max(MIN_DIMENSION, imageHeight);

        console.log("Final image dimensions:", { imageWidth, imageHeight });

        const scaledImage = image.resize(imageWidth, imageHeight);
        
        if (!scaledImage) {
          throw new Error('Failed to create image');
        }

        // Encode image
        const pngBytes = await scaledImage.encode();
        console.log("Image encoded successfully, size:", pngBytes.byteLength);

        // Initialize Supabase client
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const coverFileName = `${crypto.randomUUID()}-cover.png`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("ebooks")
            .upload(coverFileName, pngBytes, {
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