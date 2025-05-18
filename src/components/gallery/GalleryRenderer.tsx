
import { useEffect, useState, Fragment } from "react";
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
  
  // Find all gallery shortcodes in the content
  const galleryMatches = content.match(/\[gallery id="([^"]+)"\]/g) || [];
  const galleryIds = galleryMatches.map(match => match.match(/id="([^"]+)"/)?.[1]).filter(Boolean) as string[];

  // Fetch gallery data from Supabase
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
      
      // Process the image URLs to ensure proper loading
      if (galleryData) {
        return galleryData.map(gallery => ({
          ...gallery,
          gallery_images: gallery.gallery_images.map(image => ({
            ...image,
            // Ensure WebP images render correctly with proper MIME type
            url: image.url
          }))
        }));
      }
      return [];
    },
    enabled: galleryIds.length > 0,
  });

  // Process the content to place galleries in the right positions
  useEffect(() => {
    if (!galleries || galleries.length === 0) {
      setProcessedContent(content);
      if (onProcessedContent) onProcessedContent(content);
      return;
    }

    // For both mobile and desktop, replace gallery shortcodes with placeholder divs
    let newContent = content;
    galleries.forEach(gallery => {
      const shortcode = `[gallery id="${gallery.id}"]`;
      const replacement = `
        <div class="my-6 gallery-wrapper w-full" data-gallery-id="${gallery.id}">
          <div class="gallery-placeholder"></div>
        </div>
      `;
      newContent = newContent.replace(shortcode, replacement);
    });

    setProcessedContent(newContent);
    if (onProcessedContent) {
      onProcessedContent(newContent);
    }
  }, [content, galleries, onProcessedContent]);

  if (!galleries || galleries.length === 0) {
    // No galleries, just render content
    return (
      <div 
        className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>p]:mb-3 md:[&>p]:mb-4"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <>
      {/* Render content with gallery placeholders */}
      <div 
        className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>p]:mb-3 md:[&>p]:mb-4"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      
      {/* For all devices, use the initializer to find and populate placeholders */}
      <GalleryInitializer />
      
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
