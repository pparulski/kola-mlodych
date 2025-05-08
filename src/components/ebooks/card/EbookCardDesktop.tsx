
import { Button } from "@/components/ui/button";
import { BookOpenText, BookText, Edit, Info } from "lucide-react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EbookDeleteButton } from "./EbookDeleteButton";
import { Ebook } from "../types";

interface EbookCardDesktopProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
}

export function EbookCardDesktop({ ebook, onDelete, onEdit, adminMode = false }: EbookCardDesktopProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  // Default placeholder description if none is provided
  const description = ebook.description || "Ta publikacja nie zawiera jeszcze opisu. Kliknij przycisk 'Czytaj', aby przejść do treści.";

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6 text-center">{ebook.title}</h3>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4 flex flex-col items-center">
          {ebook.cover_url ? (
            <div className="relative w-full h-[280px] bg-muted/20 rounded-md overflow-hidden mb-2">
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
            <div className="w-full h-[280px] bg-muted/30 rounded-md flex items-center justify-center mb-2">
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
          
          {adminMode && (
            <div className="flex justify-end mt-6 gap-2">
              {onEdit && (
                <Button 
                  variant="outline" 
                  onClick={() => onEdit(ebook)}
                  className="transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
              )}
              {onDelete && <EbookDeleteButton onDelete={() => onDelete(ebook.id)} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
