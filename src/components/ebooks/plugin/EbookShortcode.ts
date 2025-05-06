
// Define the ebook shortcode pattern that's used for processing content
export const EBOOK_SHORTCODE_PATTERN = /\[ebook id="([^"]+)"\]/g;

// Function to create ebook shortcode
export function createEbookShortcode(ebookId: string): string {
  return `[ebook id="${ebookId}"]`;
}
