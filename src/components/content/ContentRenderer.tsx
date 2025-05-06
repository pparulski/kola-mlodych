import { processGalleryShortcodes } from '../gallery/GalleryRenderer';
import { processFileShortcodes } from '../files/FileRenderer';
import { processEbookShortcodes } from '../ebooks/EbookRenderer';
import { useEffect, useState } from 'react';

interface ContentRendererProps {
  content?: string;
}

export function ContentRenderer({ content = '' }: ContentRendererProps) {
  const [processedContent, setProcessedContent] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Multi-stage processing
    if (!content) {
      setProcessedContent([]);
      return;
    }

    // Process galleries first (as it's likely more complex)
    const withGalleriesProcessed = processGalleryShortcodes(content);

    // Convert back to string for next processing
    const htmlString = withGalleriesProcessed.map(el => {
      if (typeof el === 'string') return el;
      // For JSX elements (galleries), we use a placeholder
      if (React.isValidElement(el)) {
        return `<!--gallery-placeholder-${Math.random().toString(36).substring(2, 9)}-->`;
      }
      return '';
    }).join('');

    // Process files
    const withFilesProcessed = processFileShortcodes(htmlString);

    // Convert back to string again
    const htmlWithFiles = withFilesProcessed.map(el => {
      if (typeof el === 'string') return el;
      // For JSX elements (files), we use a placeholder
      if (React.isValidElement(el)) {
        return `<!--file-placeholder-${Math.random().toString(36).substring(2, 9)}-->`;
      }
      return '';
    }).join('');

    // Process ebooks last
    const finalContent = processEbookShortcodes(htmlWithFiles);

    // Combine all processed content
    let combinedContent: JSX.Element[] = [];
    let galleryIndex = 0;
    let fileIndex = 0;

    // Reconstruct the content with real components
    finalContent.forEach((item, index) => {
      if (typeof item === 'string') {
        // If it's a gallery placeholder, add the real gallery
        if (String(item.props?.dangerouslySetInnerHTML?.__html).includes('<!--gallery-placeholder-')) {
          combinedContent.push(withGalleriesProcessed[galleryIndex]);
          galleryIndex++;
        } 
        // If it's a file placeholder, add the real file
        else if (String(item.props?.dangerouslySetInnerHTML?.__html).includes('<!--file-placeholder-')) {
          combinedContent.push(withFilesProcessed[fileIndex]);
          fileIndex++;
        } 
        // Otherwise it's just text
        else {
          combinedContent.push(item);
        }
      } else {
        // Already processed elements (ebooks) just get added directly
        combinedContent.push(item);
      }
    });

    setProcessedContent(combinedContent);
  }, [content]);

  return (
    <div className="content-renderer">
      {processedContent}
    </div>
  );
}
