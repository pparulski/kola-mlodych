
import React from 'react';

interface StructuredDataProps {
  title: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  description?: string;
}

export function ArticleStructuredData({ 
  title, 
  image, 
  datePublished, 
  dateModified,
  description 
}: StructuredDataProps) {
  const publishDate = datePublished || new Date().toISOString().split('T')[0];
  const modifiedDate = dateModified || publishDate;
  
  const structuredData = {
    "@context": "http://schema.org/",
    "@type": "Article",
    "publisher": {
      "@type": "Organization",
      "name": "Koła Młodych OZZ Inicjatywy Pracowniczej",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mlodzi.ozzip.pl/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png"
      }
    },
    "headline": title,
    "image": image || "",
    "description": description || "",
    "datePublished": publishDate,
    "dateModified": modifiedDate
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
