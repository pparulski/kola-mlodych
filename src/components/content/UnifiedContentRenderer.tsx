
import { SocialMediaRenderer } from "@/components/editor/SocialMediaRenderer";
import { cn } from "@/lib/utils";

interface UnifiedContentRendererProps {
  content?: string;
  applyProseStyles?: boolean;
  className?: string;
}

export function UnifiedContentRenderer({ 
  content, 
  applyProseStyles = true, 
  className 
}: UnifiedContentRendererProps) {
    console.log('UnifiedContentRenderer - Processing content with galleries and social media');
  
  if (!content) return null;

  // Process gallery shortcodes first, then let SocialMediaRenderer handle the rest
  const processGalleries = (htmlContent: string) => {
    // Replace gallery shortcodes with actual gallery components
    return htmlContent.replace(/\[gallery id="([^"]+)"\]/g, (match, galleryId) => {
      // Return a placeholder that will be processed by GalleryRenderer
      return `<div class="gallery-embed" data-gallery-id="${galleryId}"></div>`;
    });
  };

  const processedContent = processGalleries(content);

  return (
    <div className={cn(
      applyProseStyles && "hugerte-content",
      className
    )}>
      <SocialMediaRenderer content={processedContent} />
    </div>
  );
}
