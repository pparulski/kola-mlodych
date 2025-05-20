
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date?: string) {
  if (!date) return "";
  
  const parsedDate = new Date(date);
  if (!isValid(parsedDate)) {
    console.error("Invalid date value:", date);
    return "";
  }
  
  return format(parsedDate, "dd.MM.yyyy");
}

/**
 * Strips HTML tags and decodes HTML entities from a string
 * Preserves all text content from all HTML elements with proper spacing
 * @param html HTML string to clean
 * @returns Plain text with decoded HTML entities and appropriate spacing
 */
export function stripHtmlAndDecodeEntities(html?: string): string {
  if (!html) return '';
  
  // Create a temporary element to parse the HTML
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Process the DOM structure to add spacing between block elements
  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Get tag name to handle specific elements
      const tagName = (node as Element).tagName.toLowerCase();
      
      // Get content from all child nodes
      let content = '';
      for (let i = 0; i < node.childNodes.length; i++) {
        content += processNode(node.childNodes[i]);
      }
      
      // Add spacing for block elements and list items
      const blockElements = ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'blockquote', 'article', 'section'];
      
      // Check if this is a block element that needs spacing
      if (blockElements.includes(tagName)) {
        // Add space before and after block elements
        return ` ${content.trim()} `;
      } else if (tagName === 'br') {
        // Add space for line breaks
        return ' ';
      }
      
      return content;
    }
    
    return '';
  };
  
  // Process the entire content
  let result = processNode(tempElement);
  
  // Clean up excess whitespace (multiple spaces, leading/trailing spaces)
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

