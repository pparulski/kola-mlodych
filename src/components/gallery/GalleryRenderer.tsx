
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
    
    // Update each iframe to allow script execution and popups if it has a sandbox attribute
    iframes.forEach(iframe => {
      if (iframe.hasAttribute('sandbox')) {
        let sandboxValue = iframe.getAttribute('sandbox') || '';
        
        // Add necessary permissions that aren't already present
        const requiredPermissions = ['allow-scripts', 'allow-popups', 'allow-popups-to-escape-sandbox'];
        let newSandboxValue = sandboxValue;
        
        requiredPermissions.forEach(permission => {
          if (!newSandboxValue.includes(permission)) {
            newSandboxValue = newSandboxValue ? `${newSandboxValue} ${permission}` : permission;
          }
        });
        
        iframe.setAttribute('sandbox', newSandboxValue);
      }
    });
  }, [content]);
  
  if (!content) return null;
  
  // Sanitize the HTML content but allow iframes with necessary attributes
  const sanitizedContent = DOMPurify.sanitize(content, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'allow', 
      'allowfullscreen', 
      'frameborder', 
      'scrolling', 
      'sandbox', 
      'src', 
      'style',
      'target' // Allow target attribute for links
    ]
  });
  
  return (
    <div 
      ref={contentRef}
      className="hugerte-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
