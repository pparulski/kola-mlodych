
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
  injectNow?: boolean;
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
  injectNow = false,
  children
}: HeadTagsProps) {
  const baseUrl = 'https://mlodzi.ozzip.pl';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;
  const defaultDescription = 'Koła Młodych OZZ Inicjatywy Pracowniczej – oficjalna strona struktur młodzieżowych związku zawodowego.';
  
  // Ensure full URLs for social media images
  const fullOgImage = ogImage && !ogImage.startsWith('http') ? `${baseUrl}${ogImage}` : ogImage;
  const fullTwitterImage = twitterImage && !twitterImage.startsWith('http') ? `${baseUrl}${twitterImage}` : twitterImage;

  // Function to create and inject meta tags
  const createAndInjectMetaTags = () => {
    console.log('HeadTags: Injecting meta tags for:', { 
      title: ogTitle || title, 
      description: ogDescription || description,
      image: fullOgImage,
      canonicalUrl: fullCanonicalUrl,
      ogType 
    });

    // Clean up any previously injected meta tags with our data-seo attribute
    const previousTags = document.head.querySelectorAll('meta[data-seo="true"], link[data-seo="true"]');
    console.log('HeadTags: Removing', previousTags.length, 'previous tags');
    previousTags.forEach(tag => {
      if (tag.parentNode === document.head) {
        document.head.removeChild(tag);
      }
    });
    
    const metaTags: (HTMLMetaElement | HTMLLinkElement)[] = [];
    
    // Description
    if (description) {
      const descTag = document.createElement('meta');
      descTag.name = 'description';
      descTag.content = description;
      descTag.setAttribute('data-seo', 'true');
      document.head.appendChild(descTag);
      metaTags.push(descTag);
    }
    
    // Keywords
    if (keywords) {
      const keywordsTag = document.createElement('meta');
      keywordsTag.name = 'keywords';
      keywordsTag.content = keywords;
      keywordsTag.setAttribute('data-seo', 'true');
      document.head.appendChild(keywordsTag);
      metaTags.push(keywordsTag);
    }
    
    // Canonical URL
    if (fullCanonicalUrl) {
      const canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      canonicalTag.href = fullCanonicalUrl;
      canonicalTag.setAttribute('data-seo', 'true');
      document.head.appendChild(canonicalTag);
      metaTags.push(canonicalTag);
    }
    
    // Open Graph tags
    const ogTags = [
      { property: 'og:site_name', content: 'Koła Młodych OZZ IP' },
      { property: 'og:locale', content: 'pl' }, // Fixed: changed from 'pl_PL' to 'pl'
      { property: 'og:type', content: ogType },
      { property: 'og:title', content: ogTitle || title || 'Koła Młodych OZZ IP' },
      { property: 'og:description', content: ogDescription || description || defaultDescription }
    ];
    
    if (fullCanonicalUrl) {
      ogTags.push({ property: 'og:url', content: fullCanonicalUrl });
    }
    
    if (fullOgImage) {
      ogTags.push({ property: 'og:image', content: fullOgImage });
      ogTags.push({ property: 'og:image:width', content: '1200' });
      ogTags.push({ property: 'og:image:height', content: '630' });
      ogTags.push({ property: 'og:image:alt', content: ogTitle || title || 'Koła Młodych OZZ IP' });
    }
    
    // Twitter tags
    const twitterTags = [
      { name: 'twitter:card', content: twitterCard },
      { name: 'twitter:title', content: twitterTitle || ogTitle || title || 'Koła Młodych OZZ IP' },
      { name: 'twitter:description', content: twitterDescription || ogDescription || description || defaultDescription }
    ];
    
    if (fullTwitterImage || fullOgImage) {
      twitterTags.push({ name: 'twitter:image', content: fullTwitterImage || fullOgImage || '' });
      twitterTags.push({ name: 'twitter:image:alt', content: twitterTitle || ogTitle || title || 'Koła Młodych OZZ IP' });
    }
    
    // Append all Open Graph tags
    ogTags.forEach(tag => {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('property', tag.property);
      metaTag.content = tag.content || '';
      metaTag.setAttribute('data-seo', 'true');
      document.head.appendChild(metaTag);
      metaTags.push(metaTag);
    });
    
    // Append all Twitter tags
    twitterTags.forEach(tag => {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('name', tag.name);
      metaTag.content = tag.content || '';
      metaTag.setAttribute('data-seo', 'true');
      document.head.appendChild(metaTag);
      metaTags.push(metaTag);
    });

    console.log('HeadTags: Successfully injected', metaTags.length, 'meta tags');
    
    return metaTags;
  };

  useEffect(() => {
    // Add a small delay to ensure DOM is ready and any static tags are loaded
    const timeoutId = setTimeout(() => {
      const metaTags = createAndInjectMetaTags();
      
      // Return cleanup function for the timeout
      return () => {
        metaTags.forEach(tag => {
          if (tag.parentNode === document.head) {
            document.head.removeChild(tag);
          }
        });
      };
    }, 50);

    // Return cleanup function for useEffect
    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    description, 
    keywords, 
    fullCanonicalUrl,
    ogType,
    ogTitle,
    ogDescription,
    fullOgImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    fullTwitterImage,
    defaultDescription
  ]);

  // If injectNow is true, we also inject the tags server-side for crawlers
  if (injectNow) {
    // Create a special "safe" version of the meta tags that can be rendered directly in the head
    const createStaticMetaTags = () => {
      const tags = [];
      
      // Basic meta tags
      if (description) {
        tags.push(<meta key="desc" name="description" content={description} data-seo="true" />);
      }
      
      if (keywords) {
        tags.push(<meta key="keywords" name="keywords" content={keywords} data-seo="true" />);
      }
      
      if (fullCanonicalUrl) {
        tags.push(<link key="canonical" rel="canonical" href={fullCanonicalUrl} data-seo="true" />);
      }
      
      // Open Graph tags
      tags.push(<meta key="og:site_name" property="og:site_name" content="Koła Młodych OZZ IP" data-seo="true" />);
      tags.push(<meta key="og:locale" property="og:locale" content="pl" data-seo="true" />);
      tags.push(<meta key="og:type" property="og:type" content={ogType} data-seo="true" />);
      tags.push(<meta key="og:title" property="og:title" content={ogTitle || title || 'Koła Młodych OZZ IP'} data-seo="true" />);
      tags.push(<meta key="og:description" property="og:description" content={ogDescription || description || defaultDescription} data-seo="true" />);
      
      if (fullCanonicalUrl) {
        tags.push(<meta key="og:url" property="og:url" content={fullCanonicalUrl} data-seo="true" />);
      }
      
      if (fullOgImage) {
        tags.push(<meta key="og:image" property="og:image" content={fullOgImage} data-seo="true" />);
        tags.push(<meta key="og:image:width" property="og:image:width" content="1200" data-seo="true" />);
        tags.push(<meta key="og:image:height" property="og:image:height" content="630" data-seo="true" />);
        tags.push(<meta key="og:image:alt" property="og:image:alt" content={ogTitle || title || 'Koła Młodych OZZ IP'} data-seo="true" />);
      }
      
      // Twitter tags
      tags.push(<meta key="twitter:card" name="twitter:card" content={twitterCard} data-seo="true" />);
      tags.push(<meta key="twitter:title" name="twitter:title" content={twitterTitle || ogTitle || title || 'Koła Młodych OZZ IP'} data-seo="true" />);
      tags.push(<meta key="twitter:description" name="twitter:description" content={twitterDescription || ogDescription || description || defaultDescription} data-seo="true" />);
      
      if (fullTwitterImage || fullOgImage) {
        tags.push(<meta key="twitter:image" name="twitter:image" content={fullTwitterImage || fullOgImage || ''} data-seo="true" />);
        tags.push(<meta key="twitter:image:alt" name="twitter:image:alt" content={twitterTitle || ogTitle || title || 'Koła Młodych OZZ IP'} data-seo="true" />);
      }
      
      return tags;
    };
    
    return (
      <>
        {createStaticMetaTags()}
        {children}
      </>
    );
  }
  
  return <>{children}</>;
}
