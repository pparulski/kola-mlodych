
import React from 'react';
import {
  TwitterEmbed,
  FacebookEmbed,
  InstagramEmbed,
  LinkedInEmbed,
  YouTubeEmbed,
  TikTokEmbed
} from 'react-social-media-embed';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GalleryView } from '@/components/gallery/GalleryView';

interface SocialMediaRendererProps {
  content: string;
}

interface SocialEmbedMatch {
  platform: string;
  url: string;
  fullMatch: string;
  index: number;
}

interface GalleryEmbedMatch {
  galleryId: string;
  fullMatch: string;
  index: number;
}

export function SocialMediaRenderer({ content }: SocialMediaRendererProps) {
  console.log('SocialMediaRenderer - Processing content:', content.substring(0, 200));
  
// Fetch gallery data for any gallery embeds in the content
  const galleryIds = [...content.matchAll(/<div[^>]*class="gallery-embed"[^>]*data-gallery-id="([^"]+)"[^>]*><\/div>/g)]
    .map(match => match[1]);

  const { data: galleries } = useQuery({
    queryKey: ['gallery-embeds', galleryIds],
    queryFn: async () => {
      if (galleryIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('article_galleries')
        .select(`
          id,
          title,
          gallery_images(id, url, caption, position)
        `)
        .in('id', galleryIds);

      if (error) throw error;
      
      // Convert to object for easy lookup
      return data.reduce((acc, gallery) => {
        acc[gallery.id] = gallery;
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: galleryIds.length > 0,
  });

  // Parse social media embeds, gallery embeds, and HTML placeholders
  const renderContent = (htmlContent: string) => {
    // Find social media shortcodes
    const socialEmbedRegex = /\[social-embed platform="([^"]+)" url="([^"]+)"\]/g;
    // Find social media HTML placeholders
    const socialPlaceholderRegex = /<div[^>]*class="social-embed-placeholder"[^>]*data-platform="([^"]+)"[^>]*data-url="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;
    // Find gallery embeds
    const galleryEmbedRegex = /<div[^>]*class="gallery-embed"[^>]*data-gallery-id="([^"]+)"[^>]*><\/div>/g;
    let processedContent = htmlContent;
    const socialMatches: SocialEmbedMatch[] = [];
    const galleryMatches: GalleryEmbedMatch[] = [];
    let match;

    // Find social media shortcode matches
    const shortcodeRegex = /\[social-embed platform="([^"]+)" url="([^"]+)"\]/g;
    while ((match = shortcodeRegex.exec(htmlContent)) !== null) {
      console.log('Found social shortcode match:', match[1], match[2]);
      socialMatches.push({
        platform: match[1],
        url: match[2],
        fullMatch: match[0],
        index: match.index
      });
    }

    // Find social media placeholder matches
    const placeholderMatches = /(<div[^>]*class="social-embed-placeholder"[^>]*data-platform="([^"]+)"[^>]*data-url="([^"]+)"[^>]*>[\s\S]*?<\/div>)/g;
    while ((match = placeholderMatches.exec(htmlContent)) !== null) {
      console.log('Found social placeholder match:', match[2], match[3]);
      socialMatches.push({
        platform: match[2],
        url: match[3],
        fullMatch: match[1],
        index: match.index
      });
    }

    // Find gallery embed matches
    while ((match = galleryEmbedRegex.exec(htmlContent)) !== null) {
      console.log('Found gallery embed match:', match[1]);
      galleryMatches.push({
        galleryId: match[1],
        fullMatch: match[0],
        index: match.index
      });
    }

    // Combine all matches and sort by index
    const allMatches = [
      ...socialMatches.map(m => ({ ...m, type: 'social' as const })),
      ...galleryMatches.map(m => ({ ...m, type: 'gallery' as const }))
    ].sort((a, b) => a.index - b.index);

    if (allMatches.length === 0) {
      console.log('No embeds found, rendering as HTML');
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    console.log('Found', allMatches.length, 'total embeds');

    // Split content and insert React components
    const parts = [];
    let lastIndex = 0;

    allMatches.forEach((embedMatch, index) => {
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

      // Add the appropriate embed
      if (embedMatch.type === 'social') {
        const socialMatch = embedMatch as SocialEmbedMatch & { type: 'social' };
        parts.push(
          <div key={`embed-${index}`} className="my-4 max-w-lg mx-auto">
            {renderSocialEmbed(socialMatch.platform, socialMatch.url)}
          </div>
        );
      } else if (embedMatch.type === 'gallery') {
        const galleryMatch = embedMatch as GalleryEmbedMatch & { type: 'gallery' };
        const gallery = galleries?.[galleryMatch.galleryId];
        if (gallery && gallery.gallery_images) {
          const sortedImages = gallery.gallery_images
            .sort((a: any, b: any) => a.position - b.position)
            .map((img: any) => ({ url: img.url, caption: img.caption }));
          
          parts.push(
            <div key={`gallery-${index}`} className="my-6">
              <GalleryView images={sortedImages} />
            </div>
          );
        }
      }
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
    
    // Use default package settings without any styling overrides
    const commonProps = {
      url
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
      {renderContent(content)}
    </div>
  );
};
