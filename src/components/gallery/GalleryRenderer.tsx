
import React, { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

interface GalleryRendererProps {
  content?: string;
}

export function GalleryRenderer({ content }: GalleryRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!contentRef.current || !content) return;
    
    // Find all iframes in the rendered content
    const iframes = contentRef.current.querySelectorAll('iframe');
    
    // Update each iframe to allow script execution if it has a sandbox attribute
    iframes.forEach(iframe => {
      if (iframe.hasAttribute('sandbox')) {
        let sandboxValue = iframe.getAttribute('sandbox') || '';
        
        // Only add allow-scripts if it's not already present
        if (!sandboxValue.includes('allow-scripts')) {
          sandboxValue = sandboxValue ? `${sandboxValue} allow-scripts` : 'allow-scripts';
          iframe.setAttribute('sandbox', sandboxValue);
        }
      }
    });
  }, [content]);
  
  if (!content) return null;
  
  // Sanitize the HTML content but allow iframes
  const sanitizedContent = DOMPurify.sanitize(content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'sandbox', 'src', 'style']
  });
  
  return (
    <div 
      ref={contentRef}
      className="hugerte-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
