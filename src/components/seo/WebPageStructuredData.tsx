
import React from 'react';

interface WebPageStructuredDataProps {
  title: string;
  description?: string;
  url: string;
  lastModified?: string;
  image?: string;
  breadcrumbs?: Array<{
    position: number;
    name: string;
    item: string;
  }>;
}

export function WebPageStructuredData({
  title,
  description,
  url,
  lastModified,
  image,
  breadcrumbs
}: WebPageStructuredDataProps) {
  const baseUrl = 'https://mlodzi.ozzip.pl';
  const fullUrl = `${baseUrl}${url}`;
  
  // Ensure full URL for image
  const fullImageUrl = image && !image.startsWith('http') ? `${baseUrl}${image}` : image;
  
  const webPageData: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "url": fullUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Koła Młodych OZZ IP",
      "url": baseUrl
    }
  };

  // Add optional properties if they exist
  if (description) {
    webPageData.description = description;
  }
  
  if (lastModified) {
    webPageData.dateModified = lastModified;
  }
  
  if (fullImageUrl) {
    webPageData.primaryImageOfPage = {
      "@type": "ImageObject",
      "contentUrl": fullImageUrl
    };
  }

  // If breadcrumbs are provided, add BreadcrumbList structured data
  if (breadcrumbs && breadcrumbs.length > 0) {
    webPageData.breadcrumb = {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map(crumb => ({
        "@type": "ListItem",
        "position": crumb.position,
        "name": crumb.name,
        "item": `${baseUrl}${crumb.item}`
      }))
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageData) }}
      data-seo="true"
    />
  );
}
