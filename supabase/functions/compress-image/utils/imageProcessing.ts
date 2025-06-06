
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { getDynamicQuality } from "./imageAnalysis.ts";

interface ProcessedImage {
  buffer: Uint8Array;
  format: string;
  filename: string;
}

export async function processImage(
  imageBuffer: Uint8Array,
  originalFilename: string,
  fileSize: number,
  needsResize: boolean = false,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<ProcessedImage> {
  try {
    // Load the image with ImageScript
    const image = await Image.decode(imageBuffer);
    console.log(`Image loaded: ${image.width}x${image.height}`);
    
    // Apply resizing if necessary (for large images)
    let processedImage = image;
    
    if (needsResize || image.width > maxWidth || image.height > maxHeight) {
      // Calculate new dimensions while maintaining aspect ratio
      const aspectRatio = image.width / image.height;
      let newWidth = maxWidth;
      let newHeight = Math.round(newWidth / aspectRatio);
      
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = Math.round(newHeight * aspectRatio);
      }
      
      processedImage = await image.resize(newWidth, newHeight);
      console.log(`Image resized to: ${newWidth}x${newHeight}`);
    }

    // Process file name
    const filenameParts = originalFilename.split('.');
    const extension = filenameParts.pop()?.toLowerCase();
    const baseFilename = filenameParts.join('.');
    
    // Choose output format based on input format
    const isJpeg = extension === 'jpg' || extension === 'jpeg';
    const isPng = extension === 'png';
    const isWebP = extension === 'webp';
    
    let outputFilename: string;
    let processedImageBuffer: Uint8Array;
    let outputFormat: string;
    
    // Calculate dynamic quality based on image content and size
    const dynamicQuality = getDynamicQuality(processedImage, fileSize);
    
    // For JPEG formats, try both WebP and JPEG compression to choose the smaller one
    if (isJpeg) {
      try {
        // WebP compression with dynamic quality
        const webpQuality = dynamicQuality / 100;
        const webpBuffer = await processedImage.encode(Image.WebP, webpQuality);
        
        // JPEG compression with slightly higher quality (JPEG needs higher quality to match WebP)
        const jpegQuality = Math.min(dynamicQuality + 5, 95) / 100;
        const jpegBuffer = await processedImage.encode(Image.JPEG, jpegQuality);
        
        // Compare sizes of both formats
        const webpSize = webpBuffer.byteLength;
        const jpegSize = jpegBuffer.byteLength;
        console.log(`WebP size: ${webpSize} bytes, JPEG size: ${jpegSize} bytes`);
        
        // Use the smaller of the two formats
        if (webpSize <= jpegSize) {
          processedImageBuffer = webpBuffer;
          outputFilename = `${baseFilename}.webp`;
          outputFormat = 'webp';
          console.log('Using WebP format (smaller)');
        } else {
          processedImageBuffer = jpegBuffer;
          outputFilename = `${baseFilename}.jpg`;
          outputFormat = 'jpeg';
          console.log('Using JPEG format (smaller)');
        }
      } catch (error) {
        console.error(`Error comparing formats: ${error.message}`);
        // Fallback to JPEG if there's an error with format comparison
        const jpegQuality = Math.min(dynamicQuality + 5, 95) / 100;
        processedImageBuffer = await processedImage.encode(Image.JPEG, jpegQuality);
        outputFilename = `${baseFilename}.jpg`;
        outputFormat = 'jpeg';
        console.log('Falling back to JPEG format due to error');
      }
    } 
    // For PNG and other formats, use WebP if it's smaller
    else if (isPng) {
      try {
        // Try both WebP and PNG
        const webpQuality = dynamicQuality / 100;
        const webpBuffer = await processedImage.encode(Image.WebP, webpQuality);
        const pngBuffer = await processedImage.encode(Image.PNG);
        
        const webpSize = webpBuffer.byteLength;
        const pngSize = pngBuffer.byteLength;
        console.log(`WebP size: ${webpSize} bytes, PNG size: ${pngSize} bytes`);
        
        if (webpSize <= pngSize) {
          processedImageBuffer = webpBuffer;
          outputFilename = `${baseFilename}.webp`;
          outputFormat = 'webp';
          console.log('Using WebP format (smaller than PNG)');
        } else {
          processedImageBuffer = pngBuffer;
          outputFilename = `${baseFilename}.png`;
          outputFormat = 'png';
          console.log('Using PNG format (smaller)');
        }
      } catch (error) {
        console.error(`Error comparing formats: ${error.message}`);
        // Fallback to PNG if there's an error with format comparison
        processedImageBuffer = await processedImage.encode(Image.PNG);
        outputFilename = `${baseFilename}.png`;
        outputFormat = 'png';
        console.log('Falling back to PNG format due to error');
      }
    }
    // For WebP input, re-encode with our quality settings
    else if (isWebP) {
      try {
        const webpQuality = dynamicQuality / 100;
        processedImageBuffer = await processedImage.encode(Image.WebP, webpQuality);
        outputFilename = `${baseFilename}.webp`;
        outputFormat = 'webp';
        console.log('Re-encoding WebP with dynamic quality');
      } catch (error) {
        console.error(`Error re-encoding WebP: ${error.message}`);
        // Just use the original buffer if re-encoding fails
        processedImageBuffer = imageBuffer;
        outputFilename = originalFilename;
        outputFormat = 'webp';
        console.log('Using original WebP due to encoding error');
      }
    }
    // For all other formats, default to WebP
    else {
      try {
        const webpQuality = dynamicQuality / 100;
        processedImageBuffer = await processedImage.encode(Image.WebP, webpQuality);
        outputFilename = `${baseFilename}.webp`;
        outputFormat = 'webp';
        console.log('Converting unknown format to WebP');
      } catch (error) {
        console.error(`Error converting to WebP: ${error.message}`);
        // Just use the original buffer if conversion fails
        processedImageBuffer = imageBuffer;
        outputFilename = originalFilename;
        outputFormat = 'unknown';
        console.log('Using original format due to conversion error');
      }
    }

    // Double check that the buffer has a valid size
    const finalSize = processedImageBuffer.byteLength;
    console.log(`Compressed image size: ${finalSize} bytes (${(finalSize / 1024 / 1024).toFixed(2)}MB)`);
    
    return {
      buffer: processedImageBuffer,
      format: outputFormat,
      filename: outputFilename
    };
  } catch (error) {
    console.error(`Error processing image: ${error.message}`);
    throw error;
  }
}
