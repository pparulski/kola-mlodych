// src/components/SEO.tsx (or wherever you prefer)
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// Your Structured Data components can remain as they are
import { ArticleStructuredData } from './ArticleStructuredData';
import { WebPageStructuredData } from './WebPageStructuredData';
import { OrganizationStructuredData } from './OrganizationStructuredData';

// Helper to make slug more readable
function prettifySlug(slug: string) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: {
    publishedAt?: string;
    modifiedAt?: string;
    categories?: string[];
    author?: string;
  };
  keywords?: string;
}

export function SEO({ title, description, image, article, keywords }: SEOProps) {
  const location = useLocation();
  const baseUrl = 'https://mlodzi.ozzip.pl';
  const canonicalUrl = `${baseUrl}${location.pathname}`;
  const isArticle = !!article;
  
  const fullImageUrl = image && !image.startsWith('http') ? `${baseUrl}${image}` : image;

  const standardizeDescription = (desc?: string): string => {
    if (!desc) return 'Koła Młodych OZZ Inicjatywy Pracowniczej – oficjalna strona struktur młodzieżowych związku zawodowego.';
    if (desc.length > 160) return `${desc.substring(0, 157)}...`;
    return desc;
  };

  const generatePageTitle = (pageTitle?: string): string => {
    const baseSiteTitle = "Koordynacja młodzieżowa OZZ Inicjatywa Pracownicza";
    if (!pageTitle) return baseSiteTitle;
    if (location.pathname === '/') return pageTitle;
    return `${pageTitle} – ${baseSiteTitle}`;
  };

  const finalTitle = generatePageTitle(title);
  const standardizedDescription = standardizeDescription(description);

  const generateBreadcrumbs = (path: string) => {
    if (path === '/') return undefined;
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [{ position: 1, name: 'Koordynacja młodzieżowa OZZ Inicjatywa Pracownicza', item: `${baseUrl}/` }];
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({ position: index + 2, name: prettifySlug(segment), item: `${baseUrl}${currentPath}` });
    });
    return breadcrumbs;
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{finalTitle}</title>
        <meta name="description" content={standardizedDescription} />
        {keywords && <meta name="keywords" content={keywords} />}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content={isArticle ? 'article' : 'website'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={finalTitle} />
        <meta property="og:description" content={standardizedDescription} />
        {fullImageUrl && <meta property="og:image" content={fullImageUrl} />}
        {fullImageUrl && <meta property="og:image:width" content="1200" />}
        {fullImageUrl && <meta property="og:image:height" content="630" />}
        <meta property="og:site_name" content="Koła Młodych OZZ IP" />
        <meta property="og:locale" content="pl" />

        {/* Twitter */}
        <meta name="twitter:card" content={fullImageUrl ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={finalTitle} />
        <meta name="twitter:description" content={standardizedDescription} />
        {fullImageUrl && <meta name="twitter:image" content={fullImageUrl} />}
        {fullImageUrl && <meta name="twitter:image:alt" content={finalTitle} />}
      </Helmet>

      {/* Render structured data components. These will render script tags. */}
      <OrganizationStructuredData />
      {isArticle ? (
        <ArticleStructuredData
          title={finalTitle}
          image={fullImageUrl}
          datePublished={article.publishedAt}
          dateModified={article.modifiedAt}
          description={standardizedDescription}
          author={article.author}
          categories={article.categories}
          url={canonicalUrl}
        />
      ) : (
        <WebPageStructuredData
          title={finalTitle}
          description={standardizedDescription}
          url={canonicalUrl}
          image={fullImageUrl}
          breadcrumbs={generateBreadcrumbs(location.pathname)}
        />
      )}
    </>
  );
}