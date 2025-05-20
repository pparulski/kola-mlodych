
import { NewsArticle } from '@/types/news';
import { stripHtmlAndDecodeEntities } from '@/lib/utils';

// Constants used across news-related hooks
export const ARTICLES_PER_PAGE = 8;

// Helper function to format news items by flattening categories
export const formatNewsItems = (rawNewsItems: any[] | null): NewsArticle[] => {
  if (!rawNewsItems) return [];
  
  return rawNewsItems.map(item => {
    // Process the preview_content if it exists
    const previewContent = item.preview_content
      ? stripHtmlAndDecodeEntities(item.preview_content)
      : item.content 
        ? stripHtmlAndDecodeEntities(item.content).substring(0, 500) 
        : "";

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
