
import React from "react";
import type { Data } from "./+data";
import { stripHtmlAndDecodeEntities } from "@/lib/utils";
import { ArticleStructuredData } from "@/components/seo/ArticleStructuredData";

export default function NewsHead({ data }: { data: Data }) {
  const { article } = data;
  
  if (!article) {
    return (
      <>
        <title>Artykuł nie znaleziony - Koła Młodych OZZ IP</title>
        <meta name="description" content="Artykuł nie został znaleziony." />
      </>
    );
  }

  const cleanExcerpt = stripHtmlAndDecodeEntities(article.content || '').substring(0, 160);
  const description = cleanExcerpt.length > 157 ? `${cleanExcerpt.substring(0, 157)}...` : cleanExcerpt;
  
  return (
    <>
      <title>{article.title} - Koła Młodych OZZ IP</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={article.title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      {article.featured_image && (
        <meta property="og:image" content={article.featured_image} />
      )}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={article.title} />
      <meta name="twitter:description" content={description} />
      {article.featured_image && (
        <meta name="twitter:image" content={article.featured_image} />
      )}
      <ArticleStructuredData
        title={article.title}
        description={description}
        image={article.featured_image}
        datePublished={article.created_at}
        dateModified={article.updated_at}
        url={`/news/${article.slug}`}
      />
    </>
  );
}
