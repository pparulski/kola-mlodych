
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { StaticPage as StaticPageType } from "@/types/staticPages";

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
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {page?.featured_image && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${page.featured_image})`,
            opacity: 0.15,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      
      <div className="relative space-y-4">
        {page ? (
          <div 
            className="prose prose-lg max-w-none dark:prose-invert mt-4 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:rounded-lg [&>img]:w-full [&>img]:h-auto"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="text-center text-muted-foreground mt-4">
            <p>Ta strona jest w trakcie tworzenia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
