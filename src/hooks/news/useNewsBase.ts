
import { NewsArticle } from '@/types/news';
import { stripHtmlAndDecodeEntities } from '@/lib/utils';

// Constants used across news-related hooks
export const ARTICLES_PER_PAGE = 8;
export const PREVIEW_LENGTH = 500; // Increased from 300 to 500 characters

// Helper function to format news items by flattening categories
export const formatNewsItems = (rawNewsItems: any[] | null): NewsArticle[] => {
  if (!rawNewsItems) return [];
  
  return rawNewsItems.map(item => {
    // Produce preview content: rely on preview_content from the DB view when present
    let previewContent = '';

    if (typeof item.preview_content === 'string' && item.preview_content.length > 0) {
      // Trust server-side cleaned and truncated preview_content
      previewContent = item.preview_content;
    } else if (typeof item.content === 'string' && item.content.length > 0) {
      // Fallback for non-view sources: make a minimal preview from full content
      let text = stripHtmlAndDecodeEntities(item.content);
      if (text.length > PREVIEW_LENGTH) {
        text = text.substring(0, PREVIEW_LENGTH).trim() + '...';
      }
      previewContent = text;
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
