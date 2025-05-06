
import { processGalleryShortcodes } from '../gallery/GalleryRenderer';
import { processFileShortcodes } from '../files/FileRenderer';
import { processEbookShortcodes } from '../ebooks/EbookRenderer';
import { useEffect, useState } from 'react';
import React from 'react';

interface ContentRendererProps {
  content?: string;
}

export function ContentRenderer({ content = '' }: ContentRendererProps) {
  const [processedContent, setProcessedContent] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (!content) {
      setProcessedContent([]);
      return;
    }

    const processContent = async () => {
      try {
        // Process shortcodes in sequence
        console.log("Processing content with length:", content.length);
        
        // Step 1: Process galleries
        const withGalleriesProcessed = processGalleryShortcodes(content);
        
        // Convert JSX elements to placeholder strings for next processing step
        let intermediateContent = '';
        const galleryPlaceholders: Record<string, JSX.Element> = {};
        
        withGalleriesProcessed.forEach((element, index) => {
          if (typeof element === 'string') {
            intermediateContent += element;
          } else if (React.isValidElement(element)) {
            const placeholder = `<!--gallery-placeholder-${index}-->`;
            galleryPlaceholders[placeholder] = element;
            intermediateContent += placeholder;
          }
        });
        
        // Step 2: Process file shortcodes
        const withFilesProcessed = processFileShortcodes(intermediateContent);
        
        // Convert to next intermediate content
        let secondIntermediateContent = '';
        const filePlaceholders: Record<string, JSX.Element> = {};
        
        withFilesProcessed.forEach((element, index) => {
          if (typeof element === 'string') {
            secondIntermediateContent += element;
          } else if (React.isValidElement(element)) {
            const placeholder = `<!--file-placeholder-${index}-->`;
            filePlaceholders[placeholder] = element;
            secondIntermediateContent += placeholder;
          }
        });
        
        // Step 3: Process ebook shortcodes
        const withEbooksProcessed = processEbookShortcodes(secondIntermediateContent);
        
        // Combine all processed content and restore placeholders
        const finalContent: JSX.Element[] = [];
        
        withEbooksProcessed.forEach((element, index) => {
          if (typeof element === 'string') {
            // Check for gallery and file placeholders in the string
            let str = element;
            let parts: (string | JSX.Element)[] = [str];
            
            // Replace gallery placeholders
            Object.entries(galleryPlaceholders).forEach(([placeholder, jsxElement]) => {
              parts = parts.flatMap(part => {
                if (typeof part !== 'string') return [part];
                const splitParts = part.split(placeholder);
                if (splitParts.length === 1) return [part];
                
                return splitParts.flatMap((subPart, i) => {
                  if (i === 0) return subPart ? [subPart] : [];
                  return [jsxElement, subPart];
                });
              });
            });
            
            // Replace file placeholders
            parts = parts.flatMap(part => {
              if (typeof part !== 'string') return [part];
              
              let result: (string | JSX.Element)[] = [part];
              Object.entries(filePlaceholders).forEach(([placeholder, jsxElement]) => {
                result = result.flatMap(subPart => {
                  if (typeof subPart !== 'string') return [subPart];
                  const splitParts = subPart.split(placeholder);
                  if (splitParts.length === 1) return [subPart];
                  
                  return splitParts.flatMap((fragment, i) => {
                    if (i === 0) return fragment ? [fragment] : [];
                    return [jsxElement, fragment];
                  });
                });
              });
              
              return result;
            });
            
            // Add all parts to final content
            parts.forEach((part, partIndex) => {
              if (typeof part === 'string') {
                finalContent.push(
                  <span key={`text-${index}-${partIndex}`} dangerouslySetInnerHTML={{ __html: part }} />
                );
              } else {
                finalContent.push(React.cloneElement(part, { key: `element-${index}-${partIndex}` }));
              }
            });
          } else if (React.isValidElement(element)) {
            finalContent.push(React.cloneElement(element, { key: `ebook-${index}` }));
          }
        });
        
        console.log("Content processing complete, elements:", finalContent.length);
        setProcessedContent(finalContent);
      } catch (error) {
        console.error("Error processing content:", error);
        // Fallback to just rendering the HTML content directly
        setProcessedContent([
          <span key="error-fallback" dangerouslySetInnerHTML={{ __html: content }} />
        ]);
      }
    };

    processContent();
  }, [content]);

  return (
    <div className="content-renderer">
      {processedContent}
    </div>
  );
}
