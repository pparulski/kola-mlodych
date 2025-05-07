
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
        
        // Generate preview with ellipsis for long content
        const preview_content = content.length > 300
          ? `${content.replace(/\[gallery id="([^"]+)"\]/g, '').substring(0, 300)}...`
          : content;
        
        console.log("NewsList rendering article:", { 
          title: article.title, 
          contentLength: content.length,
          previewStart: preview_content?.substring(0, 50) 
        });
          
        return (
          <NewsPreview
            key={article.id}
            id={article.id}
            slug={article.slug}
            title={article.title}
            preview_content={preview_content}
            content={article.content}
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
