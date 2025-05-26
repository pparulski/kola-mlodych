
import React from "react";
import { GalleryRenderer } from "@/components/gallery/GalleryRenderer";
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
  console.log('UnifiedContentRenderer - Processing content with social media and galleries');
  
  if (!content) return null;

  // First process social media embeds, then galleries
  // This component combines both renderers for complete content processing
  return (
    <div className={cn(
      applyProseStyles && "hugerte-content",
      className
    )}>
      <GalleryRenderer 
        content={content}
        applyProseStyles={false} // We're already applying prose styles at the wrapper level
        className="social-media-aware"
      />
    </div>
  );
}
