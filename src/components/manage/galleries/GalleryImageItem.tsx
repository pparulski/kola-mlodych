
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useFormattedFilename } from "@/hooks/useFormattedFilename";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GalleryImage } from "@/types/galleries";

interface GalleryImageItemProps {
  image: GalleryImage;
  onDelete: (id: string) => void;
}

export function GalleryImageItem({ image, onDelete }: GalleryImageItemProps) {
  const getFileNameFromUrl = (url: string): string => {
    try {
      const parts = new URL(url).pathname.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      return "Unknown file";
    }
  };
  
  const getFileFormat = (url: string): string => {
    try {
      const fileName = getFileNameFromUrl(url);
      const parts = fileName.split('.');
      return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'Unknown';
    } catch (e) {
      return "Unknown";
    }
  };

  const filename = getFileNameFromUrl(image.url);
  const { displayText, isTruncated } = useFormattedFilename({
    filename,
    maxLength: 30, 
  });

  return (
    <div className="border rounded p-3 bg-white dark:bg-zinc-800">
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 bg-gray-100 dark:bg-zinc-700 rounded flex-shrink-0 overflow-hidden">
          <img 
            src={image.url} 
            alt="" 
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ''; 
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const icon = document.createElement('div');
                icon.className = 'flex items-center justify-center h-full w-full';
                icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
                parent.appendChild(icon);
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Czy na pewno chcesz usunąć to zdjęcie z galerii?')) {
                onDelete(image.id);
              }
            }}
            className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-0 shadow-sm"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Usuń zdjęcie</span>
          </Button>
        </div>
        <div className="flex-1 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm font-medium truncate" title={filename}>
                  {displayText}
                </div>
              </TooltipTrigger>
              {isTruncated && (
                <TooltipContent>
                  <p>{filename}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div className="text-xs text-muted-foreground">
            Format: {getFileFormat(image.url)}
          </div>
        </div>
      </div>
    </div>
  );
}
