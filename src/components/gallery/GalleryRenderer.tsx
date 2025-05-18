
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
      
      // Ensure that the iframe allows fullscreen as well
      if (!iframe.hasAttribute('allowfullscreen')) {
        iframe.setAttribute('allowfullscreen', 'true');
      }
      
      // Add allow attribute for additional permissions if not present
      if (!iframe.hasAttribute('allow')) {
        iframe.setAttribute('allow', 'fullscreen; payment');
      } else {
        const currentAllow = iframe.getAttribute('allow') || '';
        if (!currentAllow.includes('fullscreen')) {
          iframe.setAttribute('allow', `${currentAllow}; fullscreen; payment`);
        }
      }
    });
  }, [content]);
  
  if (!content) return null;
  
  // Configure DOMPurify to allow specific tags and attributes
  // Use the DOMPurify configuration directly before sanitizing
  DOMPurify.addHook('beforeSanitizeElements', (node) => {
    // Cast the Node to HTMLElement to access tagName and hasAttribute
    const element = node as HTMLElement;
    
    // For iframe elements, ensure sandbox with all necessary permissions
    if (element.tagName === 'IFRAME' && element.hasAttribute('sandbox')) {
      // This hook runs before the main sanitization
      return node;
    }
    return node;
  });
  
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
      'target', // Allow target attribute for links
      'width',
      'height'
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
