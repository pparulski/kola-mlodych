
import React from 'react';
import {
  TwitterEmbed,
  FacebookEmbed,
  InstagramEmbed,
  LinkedInEmbed,
  YouTubeEmbed,
  TikTokEmbed
} from 'react-social-media-embed';

interface SocialMediaRendererProps {
  content: string;
}

interface SocialEmbedMatch {
  platform: string;
  url: string;
  fullMatch: string;
  index: number;
}

export function SocialMediaRenderer({ content }: SocialMediaRendererProps) {
  console.log('SocialMediaRenderer - Processing content:', content.substring(0, 200));
  
  // Parse both shortcodes AND HTML placeholders
  const renderSocialEmbeds = (htmlContent: string) => {
    // First handle shortcodes
    const socialEmbedRegex = /\[social-embed platform="([^"]+)" url="([^"]+)"\]/g;
    // Then handle HTML placeholders that might exist in saved content
    const placeholderRegex = /<div[^>]*class="social-embed-placeholder"[^>]*data-platform="([^"]+)"[^>]*data-url="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;
    
    let processedContent = htmlContent;
    const matches: SocialEmbedMatch[] = [];
    let match;

    // Find shortcode matches
    const shortcodeRegex = /\[social-embed platform="([^"]+)" url="([^"]+)"\]/g;
    while ((match = shortcodeRegex.exec(htmlContent)) !== null) {
      console.log('Found shortcode match:', match[1], match[2]);
      matches.push({
        platform: match[1],
        url: match[2],
        fullMatch: match[0],
        index: match.index
      });
    }

    // Find placeholder matches
    const placeholderMatches = /(<div[^>]*class="social-embed-placeholder"[^>]*data-platform="([^"]+)"[^>]*data-url="([^"]+)"[^>]*>[\s\S]*?<\/div>)/g;
    while ((match = placeholderMatches.exec(htmlContent)) !== null) {
      console.log('Found placeholder match:', match[2], match[3]);
      matches.push({
        platform: match[2],
        url: match[3],
        fullMatch: match[1],
        index: match.index
      });
    }

    if (matches.length === 0) {
      console.log('No social media embeds found, rendering as HTML');
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    console.log('Found', matches.length, 'social media embeds');

    // Sort matches by index to process them in order
    matches.sort((a, b) => a.index - b.index);

    // Split content and insert React components
    const parts = [];
    let lastIndex = 0;

    matches.forEach((embedMatch, index) => {
      // Add HTML content before this embed
      if (embedMatch.index > lastIndex) {
        const htmlPart = htmlContent.substring(lastIndex, embedMatch.index);
        if (htmlPart.trim()) {
          parts.push(
            <div 
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: htmlPart }} 
            />
          );
        }
      }

      // Add the social media embed
      parts.push(
        <div key={`embed-${index}`} className="my-4">
          {renderSocialEmbed(embedMatch.platform, embedMatch.url)}
        </div>
      );

      lastIndex = embedMatch.index + embedMatch.fullMatch.length;
    });

    // Add remaining HTML content
    if (lastIndex < htmlContent.length) {
      const remainingHtml = htmlContent.substring(lastIndex);
      if (remainingHtml.trim()) {
        parts.push(
          <div 
            key="html-final"
            dangerouslySetInnerHTML={{ __html: remainingHtml }} 
          />
        );
      }
    }

    return <>{parts}</>;
  };

  const renderSocialEmbed = (platform: string, url: string) => {
    console.log('Rendering social embed:', platform, url);
    
    const commonProps = {
      url,
      width: '100%',
      height: 'auto'
    };

    try {
      switch (platform.toLowerCase()) {
        case 'twitter':
          return <TwitterEmbed {...commonProps} />;
        case 'facebook':
          return <FacebookEmbed {...commonProps} />;
        case 'instagram':
          return <InstagramEmbed {...commonProps} />;
        case 'linkedin':
          return <LinkedInEmbed {...commonProps} />;
        case 'youtube':
          return <YouTubeEmbed {...commonProps} />;
        case 'tiktok':
          return <TikTokEmbed {...commonProps} />;
        default:
          return (
            <div className="p-4 border border-dashed border-gray-400 rounded bg-gray-50 text-center">
              <p className="text-gray-600">
                Unsupported platform: {platform}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                URL: {url}
              </p>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering social embed:', error);
      return (
        <div className="p-4 border border-red-400 rounded bg-red-50 text-center">
          <p className="text-red-600">
            Failed to load {platform} embed
          </p>
          <p className="text-sm text-gray-500 mt-1">
            URL: {url}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="social-media-content">
      {renderSocialEmbeds(content)}
    </div>
  );
};
