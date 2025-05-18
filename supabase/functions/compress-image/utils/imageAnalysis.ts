
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

// Helper to calculate image complexity (used for dynamic quality)
export function calculateImageComplexity(image: Image): number {
  // Sample pixels to analyze image complexity (edge detection)
  const width = image.width;
  const height = image.height;
  
  // Early return for very small images
  if (width <= 1 || height <= 1) {
    console.log("Image too small for complexity analysis, using default value");
    return 0.5; // Use a medium complexity score for tiny images
  }
  
  // Skip pixels for performance (sample every N pixels)
  const sampleStep = Math.max(1, Math.floor(Math.min(width, height) / 100));
  let edgeCount = 0;
  let sampleCount = 0;
  
  // Simple edge detection by checking color differences between adjacent pixels
  try {
    for (let y = 0; y < height - sampleStep; y += sampleStep) {
      for (let x = 0; x < width - sampleStep; x += sampleStep) {
        // Ensure we're not going beyond image boundaries
        if (x + sampleStep >= width || y + sampleStep >= height) {
          continue;
        }
        
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
  } catch (error) {
    console.error(`Error in complexity analysis: ${error.message}`);
    return 0.5; // Default to medium complexity on error
  }
  
  // Return normalized complexity score (0-1)
  return sampleCount > 0 ? edgeCount / sampleCount : 0.5;
}

// Determine dynamic quality based on image content and size
export function getDynamicQuality(image: Image, fileSize: number): number {
  try {
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
  } catch (error) {
    console.error(`Error calculating dynamic quality: ${error.message}`);
    return 80; // Default to 80% quality on error
  }
}
