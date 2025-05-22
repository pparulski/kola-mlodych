
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

  // Enhanced description handling for social media
  const socialDescription = description && description.length > 160 
    ? `${description.substring(0, 157)}...`
    : description;

  // Set page title in document directly as this is important for accessibility
  React.useEffect(() => {
    if (title) {
      document.title = isArticle ? `${title} - Młodzi IP` : title;
    }
  }, [title, isArticle]);

  return (
    <>
      <HeadTags
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={fullImageUrl}
        ogType={isArticle ? 'article' : 'website'}
        ogTitle={title}
        ogDescription={socialDescription}
        twitterCard={image ? 'summary_large_image' : 'summary'}
        twitterImage={fullImageUrl}
        twitterTitle={title}
        twitterDescription={socialDescription}
        keywords={keywords}
        injectNow={true} // Force immediate injection for crawlers
      >
        {children}
      </HeadTags>

      <OrganizationStructuredData />

      {isArticle ? (
        <ArticleStructuredData
          title={title || ''}
          image={fullImageUrl}
          datePublished={article.publishedAt}
          dateModified={article.modifiedAt}
          description={description}
          author={article.author}
          categories={article.categories}
          url={canonicalUrl}
        />
      ) : (
        <WebPageStructuredData
          title={title || 'Koła Młodych OZZ IP'}
          description={description}
          url={canonicalUrl}
          image={fullImageUrl}
          breadcrumbs={generateBreadcrumbs(canonicalUrl)}
        />
      )}
    </>
  );
}

// Helper function to generate breadcrumbs
function generateBreadcrumbs(path: string) {
  if (path === '/') return undefined;
  
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [];
  
  // Add home page
  breadcrumbs.push({
    position: 1,
    name: 'Strona główna',
    item: '/'
  });
  
  // Add segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      position: index + 2, // +2 because we start at 1 and already added home
      name: prettifySlug(segment),
      item: currentPath
    });
  });
  
  return breadcrumbs;
}

// Helper to make slug more readable
function prettifySlug(slug: string) {
  // Convert kebab-case to sentence case
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
