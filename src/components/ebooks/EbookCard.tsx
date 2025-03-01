import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="flex flex-col h-full bg-muted/10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-2 text-center">
          {ebook.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {ebook.cover_url ? (
          <button
            onClick={handleOpenPdf}
            className="w-full group"
          >
            <img
              src={ebook.cover_url}
              alt={`Okładka ${ebook.title}`}
              className="w-full object-contain rounded-md mb-4 transition-transform duration-200 group-hover:scale-105"
              style={{ maxHeight: '400px' }}
            />
          </button>
        ) : (
          <div className="w-full h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
            <span className="text-muted-foreground">Brak okładki</span>
          </div>
        )}
        {ebook.publication_year && (
          <p className="text-sm text-center dark:text-muted-foreground text-foreground">
            Rok publikacji: {ebook.publication_year}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button asChild className="flex-1">
          <a href={ebook.file_url} target="_blank" rel="noopener noreferrer">
            <BookOpenText className="mr-2 h-4 w-4" />
            Czytaj
          </a>
        </Button>
        {adminMode && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Czy na pewno chcesz usunąć tę publikację?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ta akcja jest nieodwracalna. Publikacja zostanie trwale usunięta z systemu.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(ebook.id)}>
                  Usuń
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}