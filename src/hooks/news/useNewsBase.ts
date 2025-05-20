
import { NewsArticle } from '@/types/news';
import { stripHtmlAndDecodeEntities } from '@/lib/utils';

// Constants used across news-related hooks
export const ARTICLES_PER_PAGE = 8;
export const PREVIEW_LENGTH = 300; // Define a consistent preview length

// Helper function to format news items by flattening categories
export const formatNewsItems = (rawNewsItems: any[] | null): NewsArticle[] => {
  if (!rawNewsItems) return [];
  
  return rawNewsItems.map(item => {
    // Process content to create consistent preview content with proper length
    let previewContent = '';
    
    // Use provided preview_content if available, otherwise generate from content
    if (item.preview_content) {
      previewContent = stripHtmlAndDecodeEntities(item.preview_content);
    } else if (item.content) {
      previewContent = stripHtmlAndDecodeEntities(item.content).substring(0, PREVIEW_LENGTH);
    }
    
    // Make sure we don't exceed our preview length
    if (previewContent.length > PREVIEW_LENGTH) {
      previewContent = previewContent.substring(0, PREVIEW_LENGTH);
    }
    
    // Add ellipsis only if the content is actually truncated
    const fullContent = item.content ? stripHtmlAndDecodeEntities(item.content) : '';
    if (previewContent && fullContent && previewContent.length < fullContent.length) {
      previewContent = previewContent.trim();
      if (!previewContent.endsWith('.')) {
        previewContent += '...';
      } else {
        previewContent += '..';
      }
    }

    // If the data comes from news_preview view, it already has category_names as an array
    if (item.category_names) {
      return {
        ...item,
        preview_content: previewContent,
        category_names: item.category_names.filter((name): name is string => 
          name !== null && name !== undefined && name !== ""
        )
      };
    }
    
    // For data from the regular news table, process the category data
    const categoryNames = item.news_categories?.map(
      (nc: any) => nc.categories?.name
    ).filter((name): name is string => 
      name !== null && name !== undefined && name !== ""
    ) || [];
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { news_categories, ...restOfItem } = item;

    return {
      ...restOfItem,
      preview_content: previewContent,
      category_names: categoryNames
    };
  });
};

// Interface for news query results
export interface NewsQueryResult {
  items: NewsArticle[];
  total: number;
}
