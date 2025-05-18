
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { NewsPreview } from "./news/NewsPreview";

interface NewsCardProps {
  id: string;
  title: string;
  date: string;
  content: string;
  slug: string;
  featured_image?: string | null;
  previewLength?: number;
}

export function NewsCard(props: NewsCardProps) {
  const formattedDate = format(new Date(props.date), "d MMMM yyyy", { locale: pl });
  
  // Ensure we have content before trying to access it
  const content = props.content || '';
  
  // Process the content and add ellipsis appropriately
  const previewLength = props.previewLength || 300;

  // Create a temporary element to parse HTML
  const tempEl = document.createElement('div');
  tempEl.innerHTML = content;
  const textContent = tempEl.textContent || tempEl.innerText || '';
  
  // Check if content has more text or multiple paragraphs
  const hasMoreContent = textContent.length > previewLength || content.includes('</p>') && content.split('</p>').length > 2;
  
  let preview_content = '';
  
  if (content.length > 0) {
    // Remove galleries from preview content
    const contentWithoutGalleries = content.replace(/\[gallery id="([^"]+)"\]/g, '');
    
    // Create a temporary element to parse HTML
    const parser = document.createElement('div');
    parser.innerHTML = contentWithoutGalleries;
    
    // If content contains paragraphs, take just the first one for preview
    const paragraphs = parser.querySelectorAll('p');
    
    if (paragraphs.length > 0) {
      // Take just the first paragraph with its HTML formatting
      preview_content = paragraphs[0].outerHTML;
      
      // Add ellipsis if there are more paragraphs or if the content is long
      if (hasMoreContent || paragraphs.length > 1) {
        preview_content += '...';
      }
    } else {
      // No paragraphs, truncate by character count
      preview_content = contentWithoutGalleries.substring(0, previewLength);
      if (contentWithoutGalleries.length > previewLength) {
        preview_content += '...';
      }
    }
  }
  
  console.log("NewsCard generating preview for:", {
    title: props.title,
    contentLength: content.length,
    previewLength,
    hasMoreContent,
    previewStart: preview_content?.substring(0, 50)
  });
  
  return (
    <div className="w-full">
      <NewsPreview 
        id={props.id}
        slug={props.slug}
        title={props.title}
        date={formattedDate}
        preview_content={preview_content}
        content={props.content}
        featured_image={props.featured_image || undefined}
      />
    </div>
  );
}
