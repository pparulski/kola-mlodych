
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GalleryView } from "./GalleryView";
import { GalleryInitializer } from "./GalleryInitializer";
import { useIsMobile } from "@/hooks/use-mobile";

interface GalleryRendererProps {
  content: string;
  onProcessedContent?: (content: string) => void;
}

export function GalleryRenderer({ content, onProcessedContent }: GalleryRendererProps) {
  const [processedContent, setProcessedContent] = useState(content);
  const isMobile = useIsMobile();
  
  const galleryMatches = content.match(/\[gallery id="([^"]+)"\]/g) || [];
  const galleryIds = galleryMatches.map(match => match.match(/id="([^"]+)"/)?.[1]).filter(Boolean) as string[];

  const { data: galleries } = useQuery({
    queryKey: ['galleries-for-content', galleryIds],
    queryFn: async () => {
      if (!galleryIds.length) return [];
      
      const { data: galleryData, error } = await supabase
        .from('article_galleries')
        .select(`
          id,
          title,
          gallery_images (
            id,
            url,
            caption,
            position
          )
        `)
        .in('id', galleryIds)
        .order('position', { foreignTable: 'gallery_images' });

      if (error) throw error;
      return galleryData;
    },
    enabled: galleryIds.length > 0,
  });

  useEffect(() => {
    let newContent = content;

    if (galleries && galleries.length > 0) {
      galleries.forEach(gallery => {
        const shortcode = `[gallery id="${gallery.id}"]`;
        const replacement = `
          <div class="my-6 gallery-wrapper w-full" data-gallery-id="${gallery.id}">
            <div class="gallery-placeholder"></div>
          </div>
        `;
        newContent = newContent.replace(shortcode, replacement);
      });
    }

    setProcessedContent(newContent);
    if (onProcessedContent) {
      onProcessedContent(newContent);
    }
  }, [content, galleries, onProcessedContent]);

  // Inline rendering of galleries
  if (galleries && galleries.length > 0) {
    return (
      <>
        <div 
          className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>p]:mb-3 md:[&>p]:mb-4"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
        
        {/* Render galleries directly in their placeholders */}
        {isMobile ? (
          // Direct rendering for mobile - more reliable than DOM manipulation
          galleries.map((gallery, index) => {
            const shortcode = `[gallery id="${gallery.id}"]`;
            const shortcodeIndex = content.indexOf(shortcode);
            if (shortcodeIndex >= 0) {
              return (
                <div key={gallery.id} className="my-6 w-full">
                  <GalleryView images={gallery.gallery_images} />
                </div>
              );
            }
            return null;
          })
        ) : (
          // For desktop, use the initializer which will find placeholders
          <GalleryInitializer />
        )}
        
        {/* Hidden elements containing gallery data */}
        {galleries.map(gallery => (
          <div 
            key={gallery.id} 
            className="gallery-component hidden" 
            data-id={gallery.id}
          >
            <div 
              className="gallery-data" 
              data-images={JSON.stringify(gallery.gallery_images)}
            />
          </div>
        ))}
      </>
    );
  }

  // No galleries, just render content
  return (
    <div 
      className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>p]:mb-3 md:[&>p]:mb-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
