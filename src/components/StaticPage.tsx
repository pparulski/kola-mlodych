
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { StaticPage as StaticPageType } from "@/types/staticPages";
import { GalleryRenderer } from "./gallery/GalleryRenderer";
import { toast } from "sonner";

export function StaticPage() {
  const { slug } = useParams();

  useEffect(() => {
    console.log("StaticPage component mounted with slug:", slug);
  }, [slug]);

  // Fetch page data
  const { data: page, isLoading, error } = useQuery({
    queryKey: ['static-page', slug],
    queryFn: async () => {
      if (!slug) {
        console.log("No slug provided, returning null");
        return null;
      }
      
      console.log("Fetching static page with slug:", slug);
      try {
        const { data, error } = await supabase
          .from('static_pages')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) {
          console.error("Error fetching static page:", error);
          throw error;
        }

        console.log("Static page data retrieved:", data ? "Found" : "Not found");
        if (data) {
          console.log("Page title:", data.title);
          console.log("Content length:", data.content?.length || 0);
        }
        
        return data as StaticPageType;
      } catch (err) {
        console.error("Exception in static page query:", err);
        toast.error("Nie udało się załadować strony");
        throw err;
      }
    },
    enabled: !!slug,
    staleTime: 0 // Always get fresh data
  });

  if (error) {
    console.error("Error in static page query:", error);
    return (
      <div className="bg-[hsl(var(--content-box))] p-4 rounded-lg text-foreground">
        <div className="text-lg">Wystąpił błąd podczas ładowania strony.</div>
        <div className="text-sm text-muted-foreground">{String(error)}</div>
      </div>
    );
  }

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
          <div className="prose prose-lg max-w-none dark:prose-invert hugerte-content bg-[hsl(var(--content-box))] p-3 md:p-5 rounded-lg shadow-sm">
            <GalleryRenderer content={page.content} />
          </div>
        ) : (
          <div className="text-center text-muted-foreground mt-2 bg-[hsl(var(--content-box))] p-4 rounded-lg shadow-sm">
            <p>Ta strona jest w trakcie tworzenia lub nie istnieje.</p>
            <p className="text-sm mt-2">Slug: {slug}</p>
          </div>
        )}
      </div>
    </div>
  );
}
