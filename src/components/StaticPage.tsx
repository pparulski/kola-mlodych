
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { StaticPage as StaticPageType } from "@/types/staticPages";
import { GalleryRenderer } from "./gallery/GalleryRenderer";

export function StaticPage() {
  const { slug } = useParams();

  // Fetch page data
  const { data: page, isLoading } = useQuery({
    queryKey: ['static-page', slug],
    queryFn: async () => {
      if (!slug) return null;
      console.log("Fetching static page:", slug);
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;

      console.log("Static page data:", data);
      return data as StaticPageType;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[150px]">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        {page ? (
          <div className="prose prose-lg max-w-none dark:prose-invert [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>img]:rounded-lg [&>img]:w-full [&>img]:h-auto bg-[hsl(var(--content-box))] p-3 md:p-5 rounded-lg shadow-sm">
            <GalleryRenderer content={page.content} />
          </div>
        ) : (
          <div className="text-center text-muted-foreground mt-2 bg-[hsl(var(--content-box))] p-4 rounded-lg shadow-sm">
            <p>Ta strona jest w trakcie tworzenia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
