
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, Trash2, CalendarIcon, Info } from "lucide-react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Ebook {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  created_at: string;
  publication_year?: number;
  description?: string; // Optional description field
}

interface EbookCardProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  adminMode?: boolean;
}

export function EbookCard({ ebook, onDelete, adminMode = false }: EbookCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Default placeholder description if none is provided
  const description = ebook.description || "Ta publikacja nie zawiera jeszcze opisu. Kliknij przycisk 'Czytaj', aby przejść do treści.";

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-all duration-200 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-2 text-center">
          {ebook.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col gap-3 pt-2">
        {ebook.cover_url ? (
          <div className="relative w-full h-[220px] mb-2 bg-muted/20 rounded-md overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            )}
            <button
              onClick={handleOpenPdf}
              className="w-full h-full group"
            >
              <LazyLoadImage
                src={ebook.cover_url}
                alt={`Okładka ${ebook.title}`}
                className="w-full h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                effect="opacity"
                threshold={100}
                wrapperClassName="w-full h-full"
                afterLoad={() => setImageLoaded(true)}
              />
            </button>
          </div>
        ) : (
          <div 
            className="w-full h-[220px] bg-muted/30 rounded-md mb-2 flex items-center justify-center cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={handleOpenPdf}
          >
            <span className="text-muted-foreground flex flex-col items-center">
              <BookOpenText size={48} className="mb-2 opacity-50" />
              <span>Brak okładki</span>
            </span>
          </div>
        )}
        
        <div className="space-y-2 text-sm">
          {/* Publication information with icons */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {ebook.publication_year ? `Rok publikacji: ${ebook.publication_year}` : "Rok publikacji: brak danych"}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>Dodano: {formatDate(ebook.created_at)}</span>
          </div>

          {/* Description with line clamping */}
          <div className="mt-3 bg-muted/20 p-2 rounded-md">
            <p className="line-clamp-3 text-sm text-foreground/90">
              {description}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 pt-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild className="flex-1">
                <a href={ebook.file_url} target="_blank" rel="noopener noreferrer">
                  <BookOpenText className="mr-2 h-4 w-4" />
                  Czytaj
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Otwórz publikację w nowym oknie</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
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
