
import React from 'react';
import { Helmet } from 'react-helmet';

interface HeadTagsProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  keywords?: string;
  children?: React.ReactNode;
}

export function HeadTags({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  ogTitle,
  ogDescription,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  keywords,
  children
}: HeadTagsProps) {
  const baseUrl = 'https://mlodzi.ozzip.pl';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;
  const pageTitle = title ? `${title} - Młodzi IP` : 'Koła Młodych OZZ IP';
  const defaultDescription = 'Koła Młodych OZZ Inicjatywy Pracowniczej – oficjalna strona struktur młodzieżowych związku zawodowego.';
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      {title && <title>{pageTitle}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:site_name" content="Koła Młodych OZZ IP" />
      <meta property="og:locale" content="pl_PL" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || title || 'Koła Młodych OZZ IP'} />
      <meta property="og:description" content={ogDescription || description || defaultDescription} />
      {(ogImage || twitterImage) && <meta property="og:image" content={ogImage || twitterImage} />}
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title || 'Koła Młodych OZZ IP'} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description || defaultDescription} />
      {(twitterImage || ogImage) && <meta name="twitter:image" content={twitterImage || ogImage} />}
      
      {/* Additional meta tags if provided */}
      {children}
    </Helmet>
  );
}
