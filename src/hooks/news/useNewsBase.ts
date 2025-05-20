
import { NewsArticle } from '@/types/news';
import { stripHtmlAndDecodeEntities } from '@/lib/utils';

// Constants used across news-related hooks
export const ARTICLES_PER_PAGE = 8;
export const PREVIEW_LENGTH = 500; // Increased from 300 to 500 characters

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
      // Process the full content to get plain text, preserving all elements
      previewContent = stripHtmlAndDecodeEntities(item.content);
    }
    
    // Make sure we don't exceed our preview length
    if (previewContent.length > PREVIEW_LENGTH) {
      previewContent = previewContent.substring(0, PREVIEW_LENGTH).trim();
      
      // Always add ellipsis at the end when we truncate content
      previewContent += '...';
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
