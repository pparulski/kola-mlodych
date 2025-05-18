
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

// Helper to calculate image complexity (used for dynamic quality)
export function calculateImageComplexity(image: Image): number {
  // Sample pixels to analyze image complexity (edge detection)
  const width = image.width;
  const height = image.height;
  
  // Skip pixels for performance (sample every N pixels)
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 100));
  let edgeCount = 0;
  let sampleCount = 0;
  
  // Simple edge detection by checking color differences between adjacent pixels
  for (let y = 0; y < height - sampleStep; y += sampleStep) {
    for (let x = 0; x < width - sampleStep; x += sampleStep) {
      const pixel1 = image.getPixelAt(x, y);
      const pixel2 = image.getPixelAt(x + sampleStep, y);
      const pixel3 = image.getPixelAt(x, y + sampleStep);
      
      // Calculate color differences (simple edge detection)
      const diffX = Math.abs(((pixel1 >> 16) & 0xFF) - ((pixel2 >> 16) & 0xFF)) +
                     Math.abs(((pixel1 >> 8) & 0xFF) - ((pixel2 >> 8) & 0xFF)) +
                     Math.abs((pixel1 & 0xFF) - (pixel2 & 0xFF));
      
      const diffY = Math.abs(((pixel1 >> 16) & 0xFF) - ((pixel3 >> 16) & 0xFF)) +
                     Math.abs(((pixel1 >> 8) & 0xFF) - ((pixel3 >> 8) & 0xFF)) +
                     Math.abs((pixel1 & 0xFF) - (pixel3 & 0xFF));
      
      // Count significant edges
      if (diffX > 30 || diffY > 30) {
        edgeCount++;
      }
      sampleCount++;
    }
  }
  
  // Return normalized complexity score (0-1)
  return sampleCount > 0 ? edgeCount / sampleCount : 0;
}

// Determine dynamic quality based on image content and size
export function getDynamicQuality(image: Image, fileSize: number): number {
  // Base quality depends on file size
  let baseQuality: number;
  const fileSizeMB = fileSize / (1024 * 1024);
  
  if (fileSizeMB > 5) {
    baseQuality = 70; // Lower quality for very large files
  } else if (fileSizeMB > 2) {
    baseQuality = 75; // Medium-low quality for large files
  } else if (fileSizeMB > 1) {
    baseQuality = 80; // Medium quality for medium files
  } else {
    baseQuality = 85; // Higher quality for small files
  }
  
  // Adjust based on image complexity
  const complexity = calculateImageComplexity(image);
  console.log(`Image complexity score: ${complexity.toFixed(4)} (0-1 scale)`);
  
  // Higher complexity images need higher quality to maintain details
  const qualityAdjustment = Math.round(complexity * 15);
  const finalQuality = Math.min(92, Math.max(65, baseQuality + qualityAdjustment));
  
  console.log(`Dynamic quality calculation: ${finalQuality}% (base: ${baseQuality}%, adjustment: ${qualityAdjustment}%)`);
  return finalQuality;
}
