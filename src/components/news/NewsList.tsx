
import { NewsPreview } from "@/components/news/NewsPreview";
import { EmptyNewsList } from "@/components/news/EmptyNewsList";
import { stripHtmlAndDecodeEntities } from "@/lib/utils";

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
        // Create clean preview content for the article if needed
        let previewContent = article.preview_content;
        if (!previewContent && article.content) {
          previewContent = stripHtmlAndDecodeEntities(article.content).substring(0, 500);
        }
        
        return (
          <NewsPreview
            key={article.id}
            id={article.id}
            slug={article.slug}
            title={article.title}
            preview_content={previewContent}
            content={article.content}
            date={article.date || article.created_at}
            featured_image={article.featured_image}
            category_names={Array.isArray(article.category_names) ? 
              article.category_names.filter(name => name !== null && name !== undefined) : 
              []}
          />
        );
      })}
    </div>
  );
}
