
import { NewsPreview } from "@/components/news/NewsPreview";
import { EmptyNewsList } from "@/components/news/EmptyNewsList";
import React from "react";
import { NewsletterInline } from "@/components/news/NewsletterInline";
import { NewsArticle } from "@/types/news";

interface NewsListProps {
  newsItems: NewsArticle[];
}

export function NewsList({ newsItems }: NewsListProps) {
  if (!newsItems || newsItems.length === 0) {
    return <EmptyNewsList />;
  }

  return (
    <div className="space-y-6">
      {newsItems.map((article, index) => (
        <React.Fragment key={article.id}>
          {index === 1 && (
            <NewsletterInline />
          )}
          <NewsPreview
            id={article.id}
            slug={article.slug}
            title={article.title}
            preview_content={article.preview_content}
            date={article.date || article.created_at}
            featured_image={article.featured_image}
            category_names={Array.isArray(article.category_names) ?
              article.category_names.filter(name => name !== null && name !== undefined) :
              []}
            isAboveFold={index === 0}
            articleIndex={index}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
