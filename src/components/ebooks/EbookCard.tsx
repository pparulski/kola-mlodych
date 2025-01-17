import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
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
  return (
    <Card className="flex flex-col h-full bg-muted/10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {ebook.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {ebook.cover_url ? (
          <img
            src={ebook.cover_url}
            alt={`Okładka ${ebook.title}`}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        ) : (
          <div className="w-full h-48 bg-muted rounded-md mb-4 flex items-center justify-center">
            <span className="text-muted-foreground">Brak okładki</span>
          </div>
        )}
        {ebook.publication_year && (
          <p className="text-sm text-muted-foreground">
            Rok wydania: {ebook.publication_year}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button asChild className="flex-1">
          <a href={ebook.file_url} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Pobierz
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