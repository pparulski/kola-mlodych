
import { Button } from "@/components/ui/button";
import { BookOpenText, BookText, Edit, Info, Tag, ArrowRight } from "lucide-react";
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
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slugUtils";

interface EbookCardDesktopProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
  showType?: boolean;
  showMoreButton?: boolean;
  truncateDescription?: boolean;
}

export function EbookCardDesktop({ 
  ebook, 
  onDelete, 
  onEdit, 
  adminMode = false,
  showType = false,
  showMoreButton = true,
  truncateDescription = false,
}: EbookCardDesktopProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  // Default placeholder description if none is provided
  let descriptionText = ebook.description || "Ta publikacja nie zawiera jeszcze opisu. Kliknij przycisk 'Czytaj', aby przejść do treści.";

  // Truncate description for listings if requested
  if (truncateDescription && descriptionText.length > 600) {
    descriptionText = descriptionText.substring(0, 600).trim() + '...';
  }

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
        <div className="md:w-1/4 flex flex-col items-center h-fit">
          {ebook.cover_url ? (
            <div 
              className="relative w-full bg-muted/20 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleOpenPdf}
            >
              {!imageLoaded && (
                <Skeleton className="h-full w-full absolute inset-0" />
              )}
              <LazyLoadImage
                src={ebook.cover_url}
                alt={`Okładka ${ebook.title}`}
                className="w-full h-auto object-contain rounded-md transition-transform hover:scale-[1.02]"
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
            
            <div className="bg-[hsl(var(--content-box))] rounded-md">
              <p className="text-foreground/90 whitespace-pre-line">
                {formatDescription(descriptionText)}
              </p>
            </div>
          </div>
          
          {/* Action area: More button pinned to bottom-right of the card */}
          {showMoreButton && (
            <div className="absolute bottom-3 right-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="group text-primary hover:text-accent hover:bg-transparent p-0"
              >
                <Link
                  to={`/ebooks/${ebook.slug || slugify(ebook.title)}`}
                  className="inline-flex items-center no-underline"
                  style={{ gap: 0 }}
                >
                  Więcej
                  <ArrowRight className="ml-1 h-4 w-4 transition-all duration-300 ease-in-out group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          )}

          {adminMode && (
            <div className="flex justify-end gap-2 mt-6">
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
