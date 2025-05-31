
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
    maxLength: 25, 
  });

  return (
    <div className="flex items-center justify-between border rounded p-3 bg-white dark:bg-zinc-800">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-gray-100 dark:bg-zinc-700 rounded flex-shrink-0 overflow-hidden">
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
        </div>
        <div className="overflow-hidden max-w-[calc(100%-80px)]">
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (confirm('Czy na pewno chcesz usunąć to zdjęcie z galerii?')) {
            onDelete(image.id);
          }
        }}
        className="text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Usuń zdjęcie</span>
      </Button>
    </div>
  );
}
