
import { NewsPreview } from "@/components/news/NewsPreview";
import { EmptyNewsList } from "@/components/news/EmptyNewsList";

interface NewsListProps {
  newsItems: any[];
}

export function NewsList({ newsItems }: NewsListProps) {
  console.log("NewsList rendering with items:", newsItems?.length || 0);
  
  if (!newsItems || newsItems.length === 0) {
    return <EmptyNewsList />;
  }

  return (
    <div className="space-y-6">
      {newsItems.map((article) => (
        <NewsPreview
          key={article.id}
          id={article.id}
          slug={article.slug}
          title={article.title}
          content={article.content}
          date={article.created_at}
          featured_image={article.featured_image}
        />
      ))}
    </div>
  );
}
