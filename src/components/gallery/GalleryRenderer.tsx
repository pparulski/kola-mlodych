
import React, { useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface GalleryRendererProps {
  content?: string;
  applyProseStyles?: boolean; // Prop to control prose application
  className?: string;         // To pass additional classes if needed
}

export function GalleryRenderer({ content, applyProseStyles = true, // Default to TRUE: renderer styles itself if not told otherwise
  className  }: GalleryRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!contentRef.current || !content) return;
    
    // Find all iframes in the rendered content
    const iframes = contentRef.current.querySelectorAll('iframe');
    
    // Update each iframe to ensure required permissions are present without overwriting existing ones
    iframes.forEach(iframe => {
            // ----- sandbox -----
      const requiredSandboxPermissions = [
        'allow-scripts',
        'allow-popups',
        'allow-popups-to-escape-sandbox',
        'allow-same-origin'
      ];
      const sandboxTokens = new Set(
        (iframe.getAttribute('sandbox') || '')
          .split(/\s+/)
          .filter(Boolean)
      );
      requiredSandboxPermissions.forEach(token => sandboxTokens.add(token));
      iframe.setAttribute('sandbox', Array.from(sandboxTokens).join(' '));

      // ----- allow -----
      const requiredAllowPermissions = ['fullscreen', 'payment', 'clipboard-write'];
      const allowTokens = new Set(
        (iframe.getAttribute('allow') || '')
          .split(/;\s*/)
          .filter(Boolean)
      );
      requiredAllowPermissions.forEach(token => allowTokens.add(token));
      iframe.setAttribute('allow', Array.from(allowTokens).join('; '));

      // ----- allowfullscreen -----
      if (!iframe.hasAttribute('allowfullscreen')) {
        iframe.setAttribute('allowfullscreen', 'true');
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
      className={cn(
        applyProseStyles && "hugerte-content", // Conditionally apply .hugerte-content
        className // Pass through any other classes
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
