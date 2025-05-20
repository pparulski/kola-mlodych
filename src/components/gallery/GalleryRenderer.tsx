
import React, { useRef } from "react";
import DOMPurify from "dompurify";

interface GalleryRendererProps {
  content?: string;
}

export function GalleryRenderer({ content }: GalleryRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  if (!content) return null;
  
  // Hook used during sanitization to ensure iframes keep the required attributes
  const handleIframe = (node: Element) => {
    const element = node as HTMLElement;

    if (element.tagName === 'IFRAME') {
      if (!element.hasAttribute('sandbox') || element.getAttribute('sandbox') === '') {
        element.setAttribute(
          'sandbox',
          'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin'
        );
      }

      if (!element.hasAttribute('allowfullscreen')) {
        element.setAttribute('allowfullscreen', 'true');
      }

      if (!element.hasAttribute('allow')) {
        element.setAttribute('allow', 'fullscreen; payment; clipboard-write');
      } else {
        const currentAllow = element.getAttribute('allow') || '';
        if (!currentAllow.includes('fullscreen')) {
          element.setAttribute('allow', `${currentAllow}; fullscreen; payment; clipboard-write`);
        }
      }

      if (!element.hasAttribute('referrerpolicy')) {
        element.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      }
    }
  };

  // Configure DOMPurify to allow specific tags and attributes and ensure
  // iframes retain permissions before they are inserted into the DOM
  DOMPurify.addHook('uponSanitizeElement', handleIframe);
  
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

  // Clean up the hook to avoid duplicate handlers on subsequent renders
  DOMPurify.removeHook('uponSanitizeElement');
  
  return (
    <div 
      ref={contentRef}
      className="hugerte-content"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
