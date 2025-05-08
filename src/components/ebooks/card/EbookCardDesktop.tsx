
import { Button } from "@/components/ui/button";
import { BookOpenText, BookText, Edit, Info, Tag } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface EbookCardDesktopProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
  showType?: boolean;
}

export function EbookCardDesktop({ 
  ebook, 
  onDelete, 
  onEdit, 
  adminMode = false,
  showType = false 
}: EbookCardDesktopProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  // Default placeholder description if none is provided
  const description = ebook.description || "Ta publikacja nie zawiera jeszcze opisu. Kliknij przycisk 'Czytaj', aby przejść do treści.";

  // Function to preserve line breaks in description
  const formatDescription = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-center">{ebook.title}</h3>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4 flex flex-col items-center">
          {ebook.cover_url ? (
            <div 
              className="relative w-full h-[280px] bg-muted/20 rounded-md overflow-hidden mb-1 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleOpenPdf}
            >
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
            <div 
              className="w-full h-[280px] bg-muted/30 rounded-md flex items-center justify-center mb-1 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleOpenPdf}
            >
              <BookOpenText size={64} className="opacity-50" />
            </div>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleOpenPdf} 
                  className="w-full transition-transform hover:scale-105 mt-2"
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
              {showType && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{ebook.ebook_type}</span>
                </div>
              )}
              
              {ebook.page_count && (
                <div className="flex items-center gap-2">
                  <BookText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Liczba stron: {ebook.page_count}</span>
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <p className="text-foreground/90 whitespace-pre-line">
                {formatDescription(description)}
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
