
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
  const galleryMatches = content.match(/\[gallery id="([^"]+)"\]/g) || [];
  const galleryIds = galleryMatches.map(match => match.match(/id="([^"]+)"/)?.[1]).filter(Boolean);

  const { data: galleries } = useQuery({
    queryKey: ['galleries', galleryIds],
    queryFn: async () => {
      if (!galleryIds.length) return [];
      
      const { data: galleryData, error } = await supabase
        .from('article_galleries')
        .select(`
          id,
          gallery_images (
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

  let processedContent = content;
  galleries?.forEach(gallery => {
    const placeholder = `[gallery id="${gallery.id}"]`;
    const galleryComponent = <GalleryView images={gallery.gallery_images} />;
    processedContent = processedContent.replace(placeholder, galleryComponent as any);
  });

  return (
    <div 
      className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>p]:mb-3 md:[&>p]:mb-4"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
