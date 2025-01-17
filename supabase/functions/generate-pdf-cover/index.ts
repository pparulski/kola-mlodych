import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { decode } from "https://deno.land/x/pngs@0.1.1/mod.ts";

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

        // Initialize Supabase client
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // For now, we'll use a placeholder image since we can't process PDFs
        // in a lightweight way within Edge Functions
        const placeholderImage = await fetch("https://placehold.co/600x800/png")
            .then(res => res.arrayBuffer());

        console.log("Generated placeholder image for PDF cover");

        const coverFileName = `${crypto.randomUUID()}-cover.png`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("ebooks")
            .upload(coverFileName, placeholderImage, {
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