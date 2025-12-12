interface ArticleStructuredDataProps {
  title: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  description?: string;
  author?: string;
  categories?: string[];
  url?: string;
}

export function ArticleStructuredData({ 
  title, 
  image, 
  datePublished, 
  dateModified,
  description,
  author = "Koła Młodych OZZ IP",
  categories = [],
  url
}: ArticleStructuredDataProps) {
  const baseUrl = 'https://mlodzi.ozzip.pl';
  const publishDate = datePublished || new Date().toISOString();
  const modifiedDate = dateModified || publishDate;
  
  // Ensure full URL for image
  const fullImageUrl = image && !image.startsWith('http') ? `${baseUrl}${image}` : image;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url ? `${baseUrl}${url}` : `${baseUrl}/news`
    },
    "headline": title,
    "image": fullImageUrl ? [fullImageUrl] : [],
    "datePublished": publishDate,
    "dateModified": modifiedDate,
    "author": {
      "@type": "Organization",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Koła Młodych OZZ Inicjatywy Pracowniczej",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mlodzi.ozzip.pl/img/a69f462f-ae71-40a5-a60a-babfda61840e.png"
      }
    },
    "description": description || ""
  };

  // Add categories as keywords if available
  if (categories && categories.length > 0) {
    structuredData["keywords"] = categories.join(", ");
  }

  // Render the script with the structured data
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        data-seo="true"
      />
      {/* Add basic meta tags for crawlers that might not process JavaScript */}
      <noscript>
        <meta property="article:published_time" content={publishDate} data-seo="true" />
        <meta property="article:modified_time" content={modifiedDate} data-seo="true" />
        {categories && categories.map((category, index) => (
          <meta key={index} property="article:tag" content={category} data-seo="true" />
        ))}
      </noscript>
    </>
  );
}
