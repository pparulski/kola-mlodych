
import React, { useEffect } from 'react';

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
  
  useEffect(() => {
    // Update title
    if (title) {
      document.title = pageTitle;
    }

    // Add meta tags
    const metaTags: HTMLMetaElement[] = [];
    
    // Description
    if (description) {
      const descTag = document.createElement('meta');
      descTag.name = 'description';
      descTag.content = description;
      document.head.appendChild(descTag);
      metaTags.push(descTag);
    }
    
    // Keywords
    if (keywords) {
      const keywordsTag = document.createElement('meta');
      keywordsTag.name = 'keywords';
      keywordsTag.content = keywords;
      document.head.appendChild(keywordsTag);
      metaTags.push(keywordsTag);
    }
    
    // Canonical URL
    let canonicalTag: HTMLLinkElement | null = null;
    if (fullCanonicalUrl) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      canonicalTag.href = fullCanonicalUrl;
      document.head.appendChild(canonicalTag);
    }
    
    // Open Graph tags
    const ogTags = [
      { property: 'og:site_name', content: 'Koła Młodych OZZ IP' },
      { property: 'og:locale', content: 'pl_PL' },
      { property: 'og:type', content: ogType },
      { property: 'og:title', content: ogTitle || title || 'Koła Młodych OZZ IP' },
      { property: 'og:description', content: ogDescription || description || defaultDescription }
    ];
    
    if (ogImage || twitterImage) {
      ogTags.push({ property: 'og:image', content: ogImage || twitterImage as string });
    }
    
    if (fullCanonicalUrl) {
      ogTags.push({ property: 'og:url', content: fullCanonicalUrl });
    }
    
    // Twitter tags
    const twitterTags = [
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: twitterTitle || ogTitle || title || 'Koła Młodych OZZ IP' },
      { name: 'twitter:description', content: twitterDescription || ogDescription || description || defaultDescription }
    ];
    
    if (twitterImage || ogImage) {
      twitterTags.push({ name: 'twitter:image', content: twitterImage || ogImage as string });
    }
    
    // Append all Open Graph tags
    ogTags.forEach(tag => {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('property', tag.property);
      metaTag.content = tag.content || '';
      document.head.appendChild(metaTag);
      metaTags.push(metaTag);
    });
    
    // Append all Twitter tags
    twitterTags.forEach(tag => {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('name', tag.name);
      metaTag.content = tag.content || '';
      document.head.appendChild(metaTag);
      metaTags.push(metaTag);
    });
    
    // Cleanup function to remove all added tags when component unmounts
    return () => {
      metaTags.forEach(tag => {
        if (tag.parentNode === document.head) {
          document.head.removeChild(tag);
        }
      });
      
      if (canonicalTag && canonicalTag.parentNode === document.head) {
        document.head.removeChild(canonicalTag);
      }
    };
  }, [
    title, 
    pageTitle, 
    description, 
    keywords, 
    fullCanonicalUrl,
    ogType,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    defaultDescription
  ]);
  
  return <>{children}</>;
}
