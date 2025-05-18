
import { NewsPreview } from "@/components/news/NewsPreview";
import { EmptyNewsList } from "@/components/news/EmptyNewsList";

interface NewsListProps {
  newsItems: any[];
}

export function NewsList({ newsItems }: NewsListProps) {
  if (!newsItems || newsItems.length === 0) {
    return <EmptyNewsList />;
  }

  return (
    <div className="space-y-6">
      {newsItems.map((article) => {
        // Ensure we have content before processing it
        const content = article.content || '';
        
        // Properly check if content has more paragraphs to always add ellipsis if there's more content
        // First, extract just the text content without HTML to accurately calculate length
        const tempEl = document.createElement('div');
        tempEl.innerHTML = content;
        const textContent = tempEl.textContent || tempEl.innerText || '';
        const hasMoreContent = textContent.length > 300 || content.includes('</p>') && content.split('</p>').length > 2;
        
        // Generate preview by properly handling HTML content
        const maxPreviewLength = 300;
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
            preview_content = contentWithoutGalleries.substring(0, maxPreviewLength);
            if (contentWithoutGalleries.length > maxPreviewLength) {
              preview_content += '...';
            }
          }
        }
        
        console.log("NewsList rendering article:", { 
          title: article.title, 
          contentLength: content.length,
          hasMoreContent: hasMoreContent,
          paragraphCount: content.split('</p>').length - 1,
          previewStart: preview_content?.substring(0, 50) 
        });
          
        return (
          <NewsPreview
            key={article.id}
            id={article.id}
            slug={article.slug}
            title={article.title}
            preview_content={preview_content}
            content={content}
            date={article.date || article.created_at}
            featured_image={article.featured_image}
            // Make sure to handle potential null values in category_names
            category_names={Array.isArray(article.category_names) ? 
              article.category_names.filter(name => name !== null && name !== undefined) : 
              []}
          />
        );
      })}
    </div>
  );
}
