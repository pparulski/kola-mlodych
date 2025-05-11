import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Download, Trash2 } from "lucide-react";
import { useFormattedFilename } from '@/hooks/useFormattedFilename'; // Import the hook


interface DownloadItem {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface DownloadFileItemProps {
  file: DownloadItem;
  adminMode?: boolean;
  onDelete: (id: string) => void;
}

export function DownloadFileItem({ file, adminMode = false, onDelete }: DownloadFileItemProps) {
  const { 
    displayText: formattedFilename, 
    originalName, 
    isTruncated 
  } = useFormattedFilename({
    filename: file.name,
  });


  return (
    <TableRow key={file.id} className="hover:bg-transparent group">
      <TableCell 
        title={isTruncated ? originalName : undefined}
        className="py-3 px-2"
      >
        <span className="block overflow-hidden text-ellipsis">
            {formattedFilename}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap py-3 px-2 text-sm text-muted-foreground">
        {new Date(file.created_at).toLocaleDateString("pl-PL", {
          year: 'numeric', month: 'short', day: 'numeric'
        })}
      </TableCell>
      <TableCell className="text-right align-middle py-3 px-2">
        <div className="flex md:justify-center justify-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            asChild 
            size="sm"
            className="border-primary text-primary hover:bg-primary/20"
            aria-label={`Pobierz plik ${originalName}`}
          >
            <a href={file.url} download={originalName} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Pobierz</span>
            </a>
          </Button>
          {adminMode && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(file.id)}
              aria-label={`Usuń plik ${originalName}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
