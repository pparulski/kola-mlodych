
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, Trash2, Info, BookText } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface Ebook {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  created_at: string;
  publication_year?: number;
  description?: string;
  page_count?: number;
}

interface EbookCardProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  adminMode?: boolean;
}

export function EbookCard({ ebook, onDelete, adminMode = false }: EbookCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isMobile = useIsMobile();
  
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  // Default placeholder description if none is provided
  const description = ebook.description || "Ta publikacja nie zawiera jeszcze opisu. Kliknij przycisk 'Czytaj', aby przejść do treści.";

  return (
    <Card className="w-full mb-6 hover:shadow-md transition-all duration-300 animate-fade-in bg-card border border-border/50">
      {isMobile ? (
        // Mobile layout with accordion
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">{ebook.title}</h3>
          
          <div className="flex justify-center mb-4">
            {ebook.cover_url ? (
              <div className="relative w-[140px] h-[180px] bg-muted/20 rounded-md overflow-hidden">
                {!imageLoaded && (
                  <Skeleton className="h-full w-full absolute inset-0" />
                )}
                <LazyLoadImage
                  src={ebook.cover_url}
                  alt={`Okładka ${ebook.title}`}
                  className="w-full h-full object-contain rounded-md"
                  effect="opacity"
                  threshold={100}
                  afterLoad={() => setImageLoaded(true)}
                />
              </div>
            ) : (
              <div className="w-[140px] h-[180px] bg-muted/30 rounded-md flex items-center justify-center">
                <BookOpenText size={48} className="opacity-50" />
              </div>
            )}
          </div>

          <div className="flex justify-center mb-4">
            <Button onClick={handleOpenPdf} className="w-full max-w-[140px] transition-transform hover:scale-105">
              <BookOpenText className="mr-2 h-4 w-4" />
              Czytaj
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm">
                Szczegóły publikacji
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-sm space-y-2 pt-2">
                  {ebook.page_count && (
                    <div className="flex items-center gap-2">
                      <BookText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Liczba stron: {ebook.page_count}</span>
                    </div>
                  )}
                  
                  {ebook.publication_year && (
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Rok publikacji: {ebook.publication_year}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 bg-muted/10 p-3 rounded-md">
                    <p className="text-foreground/90">{description}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {adminMode && onDelete && (
            <div className="flex justify-end mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Usuń
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
            </div>
          )}
        </div>
      ) : (
        // Desktop layout with side-by-side content
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-6">{ebook.title}</h3>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 flex flex-col items-center">
              {ebook.cover_url ? (
                <div className="relative w-full h-[280px] bg-muted/20 rounded-md overflow-hidden mb-4">
                  {!imageLoaded && (
                    <Skeleton className="h-full w-full absolute inset-0" />
                  )}
                  <LazyLoadImage
                    src={ebook.cover_url}
                    alt={`Okładka ${ebook.title}`}
                    className="w-full h-full object-contain rounded-md transition-transform hover:scale-[1.02]"
                    effect="opacity"
                    threshold={100}
                    afterLoad={() => setImageLoaded(true)}
                  />
                </div>
              ) : (
                <div className="w-full h-[280px] bg-muted/30 rounded-md flex items-center justify-center mb-4">
                  <BookOpenText size={64} className="opacity-50" />
                </div>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleOpenPdf} 
                      className="w-full transition-transform hover:scale-105"
                    >
                      <BookOpenText className="mr-2 h-4 w-4" />
                      Czytaj
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Otwórz publikację w nowym oknie</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="md:w-3/4">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {ebook.page_count && (
                    <div className="flex items-center gap-2">
                      <BookText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Liczba stron: {ebook.page_count}</span>
                    </div>
                  )}
                  
                  {ebook.publication_year && (
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Rok publikacji: {ebook.publication_year}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-muted/10 p-4 rounded-md">
                  <p className="text-foreground/90">
                    {description}
                  </p>
                </div>
              </div>
              
              {adminMode && onDelete && (
                <div className="flex justify-end mt-6">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Usuń publikację
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
