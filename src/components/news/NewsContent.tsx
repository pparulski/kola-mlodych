
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GalleryView } from "../gallery/GalleryView";

interface NewsContentProps {
  content: string;
  title?: string;
  date?: string;
  featured_image?: string;
}

export function NewsContent({ content }: NewsContentProps) {
  const [processedContent, setProcessedContent] = useState(content);
  
  // Extract gallery IDs from shortcodes
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
        .in('id', galleryIds);

      if (error) throw error;
      return galleryData;
    },
    enabled: galleryIds.length > 0,
  });

  useEffect(() => {
    if (!galleries || !galleries.length) {
      setProcessedContent(content);
      return;
    }

    let newContent = content;
    galleries.forEach(gallery => {
      const placeholder = `[gallery id="${gallery.id}"]`;
      const galleryHtml = `<div class="gallery-container my-6" data-gallery-id="${gallery.id}">
        <div class="gallery-title mb-2 font-medium">${gallery.title}</div>
        <div class="gallery-images">
          <!-- Gallery will be rendered by GalleryView component -->
        </div>
      </div>`;
      newContent = newContent.replace(placeholder, galleryHtml);
    });

    setProcessedContent(newContent);
  }, [content, galleries]);

  return (
    <>
      <div 
        className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>p]:mb-3 md:[&>p]:mb-4"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      
      {galleries?.map(gallery => (
        <div key={gallery.id} className="gallery-render" style={{ display: 'none' }}>
          <GalleryView images={gallery.gallery_images} />
        </div>
      ))}
      
      {galleryIds.length > 0 && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const galleryContainers = document.querySelectorAll('.gallery-container');
                galleryContainers.forEach(container => {
                  const galleryId = container.getAttribute('data-gallery-id');
                  const galleryImagesDiv = container.querySelector('.gallery-images');
                  if (galleryImagesDiv) {
                    const galleryRender = document.querySelector('.gallery-render[data-id="' + galleryId + '"]');
                    if (galleryRender) {
                      galleryImagesDiv.innerHTML = galleryRender.innerHTML;
                    }
                  }
                });
              });
            `
          }}
        />
      )}
    </>
  );
}
