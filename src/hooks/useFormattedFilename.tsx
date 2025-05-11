// src/hooks/useFormattedFilename.ts
import React, { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export interface FormattedFilenameData {
  displayText: React.ReactNode;
  isTruncated: boolean;
  originalName: string;
}

interface UseFormattedFilenameProps {
  filename: string;
  mobileBaseNameMaxLength?: number;
  desktopBaseNameMaxLength?: number;
  ellipsis?: string;
}

export function useFormattedFilename({
  filename, // This is the full original filename
  mobileBaseNameMaxLength = 50,
  desktopBaseNameMaxLength = 120,
  ellipsis = "..",
}: UseFormattedFilenameProps): FormattedFilenameData {
  const isMobile = useIsMobile();

  // The useMemo hook will compute the formatted data.
  // It depends on filename, isMobile, and the length/ellipsis props.
  const formattedData = useMemo(() => {
    const currentOriginalName = filename; // Use the passed filename as the original
    let currentBaseName = filename;
    let currentExtension = '';
    let currentWasBaseNameTruncated = false;

    const currentMaxLength = isMobile ? mobileBaseNameMaxLength : desktopBaseNameMaxLength;

    const lastDotIndex = currentOriginalName.lastIndexOf('.');
    if (lastDotIndex > 0 && lastDotIndex < currentOriginalName.length - 1) {
      currentBaseName = currentOriginalName.substring(0, lastDotIndex);
      currentExtension = currentOriginalName.substring(lastDotIndex + 1);
    }
    // If no extension, currentBaseName remains the full originalName, currentExtension is ''

    if (currentBaseName.length > currentMaxLength) {
      currentBaseName = currentBaseName.substring(0, currentMaxLength);
      currentWasBaseNameTruncated = true;
    }

    let calculatedDisplayText: React.ReactNode;

    if (!currentExtension) {
      // No extension
      calculatedDisplayText = (
        <>
          {currentBaseName}
          {currentWasBaseNameTruncated ? ellipsis : ''}
        </>
      );
    } else {
      // Has an extension
      if (currentWasBaseNameTruncated) {
        calculatedDisplayText = (
          <>
            {currentBaseName}
            {ellipsis}
            <span className="text-primary">.</span>
            {currentExtension}
          </>
        );
      } else {
        // Base name was not truncated, but still show styled dot for extension
        calculatedDisplayText = (
          <>
            {currentBaseName}
            <span className="text-primary">.</span>
            {currentExtension}
          </>
        );
      }
    }

    // This object is what useMemo's callback returns
    return {
      displayText: calculatedDisplayText,
      isTruncated: currentWasBaseNameTruncated,
      originalName: currentOriginalName, // Return the original full filename
    };
  }, [filename, isMobile, mobileBaseNameMaxLength, desktopBaseNameMaxLength, ellipsis]); // Correct dependencies for useMemo

  // The hook itself returns the result of useMemo
  return formattedData;
}