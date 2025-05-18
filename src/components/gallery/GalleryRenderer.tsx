
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
    
    // Update each iframe to allow script execution and popups
    iframes.forEach(iframe => {
      // Add sandbox attribute with necessary permissions if it doesn't exist or is empty
      if (!iframe.hasAttribute('sandbox') || iframe.getAttribute('sandbox') === '') {
        iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin');
      } else {
        // If sandbox exists but doesn't have all required permissions, add them
        let sandboxValue = iframe.getAttribute('sandbox') || '';
        
        // Add necessary permissions that aren't already present
        const requiredPermissions = ['allow-scripts', 'allow-popups', 'allow-popups-to-escape-sandbox', 'allow-same-origin'];
        let newSandboxValue = sandboxValue;
        
        requiredPermissions.forEach(permission => {
          if (!newSandboxValue.includes(permission)) {
            newSandboxValue = newSandboxValue ? `${newSandboxValue} ${permission}` : permission;
          }
        });
        
        iframe.setAttribute('sandbox', newSandboxValue);
      }
      
      // Ensure that the iframe allows fullscreen
      if (!iframe.hasAttribute('allowfullscreen')) {
        iframe.setAttribute('allowfullscreen', 'true');
      }
      
      // Add allow attribute for additional permissions if not present
      if (!iframe.hasAttribute('allow')) {
        iframe.setAttribute('allow', 'fullscreen; payment; clipboard-write');
      } else {
        const currentAllow = iframe.getAttribute('allow') || '';
        if (!currentAllow.includes('fullscreen')) {
          iframe.setAttribute('allow', `${currentAllow}; fullscreen; payment; clipboard-write`);
        }
      }

      // Set referrerpolicy to avoid referrer restrictions
      if (!iframe.hasAttribute('referrerpolicy')) {
        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      }
    });
  }, [content]);
  
  if (!content) return null;
  
  // Configure DOMPurify to allow specific tags and attributes
  DOMPurify.addHook('beforeSanitizeElements', (node) => {
    // Cast the Node to HTMLElement to access tagName and hasAttribute
    const element = node as HTMLElement;
    
    // For iframe elements, handle sandbox attribute
    if (element.tagName === 'IFRAME') {
      // Don't modify the node here, this is just pre-sanitization check
      // The actual modification happens in the useEffect hook above
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
      'target',
      'width',
      'height',
      'referrerpolicy'
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
