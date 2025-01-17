import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Ebook {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  created_at: string;
  publication_year?: number;
}

interface EbookCardProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  adminMode?: boolean;
}

export function EbookCard({ ebook, onDelete, adminMode = false }: EbookCardProps) {
  const handleClick = () => {
    window.open(ebook.file_url, '_blank');
  };

  return (
    <Card className="w-[300px] h-[300px] flex flex-col group">
      <CardHeader className="text-center pb-2">
        <CardTitle 
          className="text-lg truncate relative inline-block cursor-pointer after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left" 
          title={ebook.title}
          onClick={handleClick}
        >
          {ebook.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div 
          className="relative w-full h-48 mb-4 overflow-hidden cursor-pointer"
          onClick={handleClick}
        >
          {ebook.cover_url ? (
            <img
              src={ebook.cover_url}
              alt={`Cover of ${ebook.title}`}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-muted-foreground text-sm">No cover image</div>
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground text-center">
          <span>Rok publikacji: {ebook.publication_year || "N/A"}</span>
        </div>
      </CardContent>
      {adminMode && onDelete && (
        <CardFooter className="justify-end pt-0">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(ebook.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}