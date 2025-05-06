
// Define the file shortcode pattern that's used for processing content
export const FILE_SHORTCODE_PATTERN = /\[file id="([^"]+)"\]/g;

// Function to create file shortcode
export function createFileShortcode(fileId: string): string {
  return `[file id="${fileId}"]`;
}
