
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenText, BookText, Info } from "lucide-react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EbookDeleteButton } from "./EbookDeleteButton";
import { Ebook } from "../types";

interface EbookCardMobileProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  adminMode?: boolean;
}

export function EbookCardMobile({ ebook, onDelete, adminMode = false }: EbookCardMobileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  // Default placeholder description if none is provided
  const description = ebook.description || "Ta publikacja nie zawiera jeszcze opisu. Kliknij przycisk 'Czytaj', aby przejść do treści.";

  return (
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
          <EbookDeleteButton onDelete={() => onDelete(ebook.id)} />
        </div>
      )}
    </div>
  );
}
