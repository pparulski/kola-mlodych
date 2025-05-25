
import React from 'react';
import { HeadTags } from './HeadTags';
import { ArticleStructuredData } from './ArticleStructuredData';
import { WebPageStructuredData } from './WebPageStructuredData';
import { OrganizationStructuredData } from './OrganizationStructuredData';
import { useLocation } from 'react-router-dom';

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
  children?: React.ReactNode;
}

export function SEO({
  title,
  description,
  image,
  article,
  keywords,
  children
}: SEOProps) {
  const location = useLocation();
  const canonicalUrl = location.pathname;
  const isArticle = !!article;
  const baseUrl = 'https://mlodzi.ozzip.pl';
  const fullImageUrl = image && !image.startsWith('http') ? `${baseUrl}${image}` : image;

  // Standardize description to exactly 160 characters
  const standardizeDescription = (desc?: string): string => {
    if (!desc) return '';
    
    // If description is longer than 160 characters, truncate and add ellipsis
    if (desc.length > 160) {
      return `${desc.substring(0, 157)}...`;
    }
    
    return desc;
  };

  const standardizedDescription = standardizeDescription(description);

  // Generate page title with consistent format
  const generatePageTitle = (pageTitle?: string): string => {
    const baseSiteTitle = "Koordynacja młodzieżowa OZZ Inicjatywa Pracownicza";
    
    if (!pageTitle) {
      return baseSiteTitle;
    }
    
    // For homepage, use the full title as provided
    if (location.pathname === '/') {
      return pageTitle;
    }
    
    // For other pages, append the base title
    return `${pageTitle} – ${baseSiteTitle}`;
  };

  const finalTitle = generatePageTitle(title);

  // Set page title in document - this is the single source of truth
  React.useEffect(() => {
    document.title = finalTitle;
    console.log('SEO: Setting document title to:', finalTitle);
  }, [finalTitle]);

  // Generate breadcrumbs with proper titles
  const generateBreadcrumbs = (path: string) => {
    if (path === '/') return undefined;
    
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Add home page with the official title
    breadcrumbs.push({
      position: 1,
      name: 'Koordynacja młodzieżowa OZZ Inicjatywa Pracownicza',
      item: '/'
    });
    
    // Add segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        position: index + 2,
        name: prettifySlug(segment),
        item: currentPath
      });
    });
    
    return breadcrumbs;
  };

  // Debug SEO data being passed
  React.useEffect(() => {
    console.log('SEO: Rendering with data:', {
      finalTitle,
      standardizedDescription,
      fullImageUrl,
      canonicalUrl,
      isArticle,
      article
    });
  }, [finalTitle, standardizedDescription, fullImageUrl, canonicalUrl, isArticle, article]);

  return (
    <>
      <HeadTags
        title={finalTitle}
        description={standardizedDescription}
        canonicalUrl={canonicalUrl}
        ogImage={fullImageUrl}
        ogType={isArticle ? 'article' : 'website'}
        ogTitle={finalTitle}
        ogDescription={standardizedDescription}
        twitterCard={fullImageUrl ? 'summary_large_image' : 'summary'}
        twitterImage={fullImageUrl}
        twitterTitle={finalTitle}
        twitterDescription={standardizedDescription}
        keywords={keywords}
        injectNow={true}
      >
        {children}
      </HeadTags>

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
          breadcrumbs={generateBreadcrumbs(canonicalUrl)}
        />
      )}
    </>
  );
}

// Helper to make slug more readable
function prettifySlug(slug: string) {
  // Convert kebab-case to sentence case
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
