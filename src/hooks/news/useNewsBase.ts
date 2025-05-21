
import { NewsArticle } from "@/types/news";

// Define the number of articles to display per page
export const ARTICLES_PER_PAGE = 8;

// Define the shape of the news query result
export interface NewsQueryResult {
  items: NewsArticle[];
  total: number;
}

// Format news items to clean up HTML content for previews
export const formatNewsItems = (newsItems: any[]): NewsArticle[] => {
  return newsItems.map(item => {
    // Create a clean preview from HTML content if needed
    let preview = item.preview_content;
    
    // If preview_content is HTML, clean it up
    if (preview && (preview.includes('<') || preview.includes('&'))) {
      // Remove HTML tags
      preview = preview.replace(/<\/?[^>]+(>|$)/g, " ")
        // Replace HTML entities
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        // Remove extra whitespace
        .replace(/\s+/g, " ")
        .trim();
    }
    
    // Return formatted news item
    return {
      ...item,
      preview_content: preview
    };
  });
};
