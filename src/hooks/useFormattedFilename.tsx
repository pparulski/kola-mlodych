import { useState, useEffect } from 'react';

interface UseFormattedFilenameProps {
  filename: string;
  maxLength?: number;
}

interface UseFormattedFilenameResult {
  displayText: string;
  originalName: string;
  isTruncated: boolean;
}

/**
 * Extracts the original filename from a storage URL or timestamped filename
 * and provides a truncated version if needed
 */
export function useFormattedFilename({
  filename,
  maxLength = 40
}: UseFormattedFilenameProps): UseFormattedFilenameResult {
  const [displayText, setDisplayText] = useState(filename);
  const [originalName, setOriginalName] = useState(filename);
  const [isTruncated, setIsTruncated] = useState(false);
  
  useEffect(() => {
    if (!filename) {
      setDisplayText('');
      setOriginalName('');
      setIsTruncated(false);
      return;
    }
    
    try {
      // Extract the filename without timestamp
      // Pattern looks for _1234567890.ext at the end of the filename
      const match = filename.match(/(.+)_\d{10,}(\.\w+)$/);
      
      // If we found a match with timestamp pattern, use the original name
      // Otherwise use the full filename
      const cleanedName = match ? `${match[1]}${match[2]}` : filename;
      
      // For display, replace underscores with spaces for better readability
      const displayName = cleanedName.replace(/_/g, ' ');
      
      setOriginalName(displayName);
      
      // Truncate if necessary
      if (displayName.length > maxLength) {
        setDisplayText(displayName.substring(0, maxLength) + '...');
        setIsTruncated(true);
      } else {
        setDisplayText(displayName);
        setIsTruncated(false);
      }
    } catch (error) {
      console.error('Error formatting filename:', error);
      setDisplayText(filename);
      setOriginalName(filename);
      setIsTruncated(false);
    }
  }, [filename, maxLength]);
  
  return { displayText, originalName, isTruncated };
}
