
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { StaticPage as StaticPageType } from "@/types/staticPages";
import { GalleryRenderer } from "./gallery/GalleryRenderer";
import { LoadingIndicator } from "./home/LoadingIndicator";
import { AlertCircle } from "lucide-react";

export function StaticPage() {
  const { slug } = useParams();

  // Fetch page data
  const { data: page, isLoading, error } = useQuery({
    queryKey: ['static-page', slug],
    queryFn: async () => {
      if (!slug) return null;
      console.log("Fetching static page:", slug);
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

        console.log("Static page data:", data ? "found" : "not found");
        return data as StaticPageType;
      } catch (err) {
        console.error("Exception in static page fetch:", err);
        throw err;
      }
    },
    enabled: !!slug,
    retry: 1
  });

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [slug, page]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
          <h3 className="font-medium">Błąd podczas ładowania strony</h3>
        </div>
        <p className="mt-2 text-sm">
          {error instanceof Error ? error.message : 'Nieznany błąd'}
        </p>
        <p className="mt-2 text-sm">Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.</p>
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
