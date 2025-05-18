
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
      // WebP compression with dynamic quality
      const webpQuality = dynamicQuality / 100;
      const webpBuffer = await processedImage.encode(Image.WebP, webpQuality);
      
      // JPEG compression with slightly higher quality (JPEG needs higher quality to match WebP)
      const jpegQuality = Math.min(dynamicQuality + 5, 95) / 100;
      const jpegBuffer = await processedImage.encode(Image.JPEG, jpegQuality);
      
      // Compare sizes of both formats
      console.log(`WebP size: ${webpBuffer.byteLength} bytes, JPEG size: ${jpegBuffer.byteLength} bytes`);
      
      // Use the smaller of the two formats
      if (webpBuffer.byteLength <= jpegBuffer.byteLength) {
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
    } 
    // For PNG and other formats, use WebP if it's smaller
    else if (isPng) {
      // Try both WebP and PNG
      const webpQuality = dynamicQuality / 100;
      const webpBuffer = await processedImage.encode(Image.WebP, webpQuality);
      const pngBuffer = await processedImage.encode(Image.PNG);
      
      console.log(`WebP size: ${webpBuffer.byteLength} bytes, PNG size: ${pngBuffer.byteLength} bytes`);
      
      if (webpBuffer.byteLength <= pngBuffer.byteLength) {
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
    }
    // For WebP input, re-encode with our quality settings
    else if (isWebP) {
      const webpQuality = dynamicQuality / 100;
      processedImageBuffer = await processedImage.encode(Image.WebP, webpQuality);
      outputFilename = `${baseFilename}.webp`;
      outputFormat = 'webp';
      console.log('Re-encoding WebP with dynamic quality');
    }
    // For all other formats, default to WebP
    else {
      const webpQuality = dynamicQuality / 100;
      processedImageBuffer = await processedImage.encode(Image.WebP, webpQuality);
      outputFilename = `${baseFilename}.webp`;
      outputFormat = 'webp';
      console.log('Converting unknown format to WebP');
    }

    console.log(`Compressed image size: ${processedImageBuffer.byteLength} bytes (${(processedImageBuffer.byteLength / 1024 / 1024).toFixed(2)}MB)`);
    
    // Calculate compression ratio (original / new)
    const compressionRatio = (fileSize / processedImageBuffer.byteLength).toFixed(2);
    console.log(`Compression ratio: ${compressionRatio}x (${fileSize} / ${processedImageBuffer.byteLength})`);
    
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
