
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Download, Trash2 } from "lucide-react";

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
  return (
    <TableRow key={file.id} className="hover:bg-transparent">
      <TableCell>{file.name}</TableCell>
      <TableCell className="whitespace-nowrap">
        {new Date(file.created_at).toLocaleDateString("pl-PL")}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex md:justify-center justify-center gap-2 flex-wrap">
          <Button variant="outline" asChild size="sm">
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Pobierz</span>
            </a>
          </Button>
          {adminMode && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(file.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
