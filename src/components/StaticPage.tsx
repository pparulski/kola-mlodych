
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { StaticPage as StaticPageType } from "@/types/staticPages";
import { UnifiedContentRenderer } from "./content/UnifiedContentRenderer";
import { toast } from "sonner";
import { SEO } from "@/components/seo/SEO";
import { stripHtmlAndDecodeEntities } from "@/lib/utils";

export function StaticPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

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
        // First try to find a static page
        const { data: staticPageData, error: staticPageError } = await supabase
          .from('static_pages')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (staticPageError) {
          console.error("Error fetching static page:", staticPageError);
          throw staticPageError;
        }

        if (staticPageData) {
          console.log("Static page data retrieved: Found");
          console.log("Page title:", staticPageData.title);
          console.log("Content length:", staticPageData.content?.length || 0);
          return staticPageData as StaticPageType;
        }

        // If no static page found, check for news article with short_url
        console.log("Static page data retrieved: Not found, checking for news with short_url");
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('slug')
          .eq('short_url', slug)
          .maybeSingle();

        if (newsError) {
          console.error("Error fetching news with short_url:", newsError);
          // Don't throw here, just return null to show "page doesn't exist"
        }

        if (newsData) {
          console.log("Found news article with short_url, redirecting to:", `/news/${newsData.slug}`);
          // Redirect to the full news article URL
          navigate(`/news/${newsData.slug}`, { replace: true });
          return null;
        }

        console.log("No static page or news article found for slug:", slug);
        return null;
      } catch (err) {
        console.error("Exception in static page query:", err);
        toast.error("Nie udało się załadować strony");
        throw err;
      }
    },
    enabled: !!slug,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Generate a clean excerpt for SEO description (standardized to 160 chars)
  const generateExcerpt = (content?: string): string => {
    if (!content) return '';
    
    // Use our improved HTML stripping function with proper spacing
    const plainText = stripHtmlAndDecodeEntities(content);
    
    // Limit to exactly 160 characters for SEO meta description
    if (plainText.length > 160) {
      return `${plainText.substring(0, 157)}...`;
    }
    
    return plainText;
  };

  // Extract first image from content for SEO
  const extractFirstImage = (content?: string): string | undefined => {
    if (!content) return undefined;
    
    // Look for image tags in the content
    const imgRegex = /<img[^>]+src="([^"]+)"/i;
    const match = content.match(imgRegex);
    
    if (match && match[1]) {
      // If it's already a full URL, return as is
      if (match[1].startsWith('http')) {
        return match[1];
      }
      // If it's a relative URL, make it absolute
      return match[1];
    }
    
    return undefined;
  };

  if (error) {
    console.error("Error in static page query:", error);
    return (
      <div className="bg-[hsl(var(--content-box))] p-4 rounded-lg text-foreground mt-2">
        <div className="text-lg">Wystąpił błąd podczas ładowania strony.</div>
        <div className="text-sm text-muted-foreground">{String(error)}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[150px] mt-2">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {page && (
        <SEO
          title={page.title}
          description={generateExcerpt(page.content)}
          image={extractFirstImage(page.content)}
        />
      )}
      
      <div className="relative">
        {page && page.content ? (
          <div className="bg-[hsl(var(--content-box))] p-4 md:p-5 rounded-lg shadow-sm">
            <UnifiedContentRenderer
              content={page.content}
              applyProseStyles={true}
            />
          </div>
        ) : (
          <div className="text-center text-muted-foreground bg-[hsl(var(--content-box))] p-4 md:p-5 rounded-lg shadow-sm">
            <p>Ta strona nie istnieje.</p>
          </div>
        )}
      </div>
    </div>
  );
}