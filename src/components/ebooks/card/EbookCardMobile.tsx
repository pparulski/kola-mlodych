
import { Button } from "@/components/ui/button";
import { BookOpenText, BookText, Edit, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { EbookDeleteButton } from "./EbookDeleteButton";
import { Ebook } from "../types";
import { EbookCover } from "./EbookCover";

interface EbookCardMobileProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
}

export function EbookCardMobile({ ebook, onDelete, onEdit, adminMode = false }: EbookCardMobileProps) {
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  // Default placeholder description if none is provided
  const description = ebook.description || "Ta publikacja nie zawiera jeszcze opisu. Kliknij przycisk 'Czytaj', aby przejść do treści.";

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3 text-center">{ebook.title}</h3>
      
      <div className="flex justify-center mb-1">
        <EbookCover 
          coverUrl={ebook.cover_url} 
          title={ebook.title} 
          size="small" 
          onClick={handleOpenPdf}
        />
      </div>

      <div className="flex justify-center mt-2 mb-3">
        <Button onClick={handleOpenPdf} className="w-full max-w-[200px] transition-transform hover:scale-105">
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
              
              <div className="mt-3 bg-muted/30 p-3 rounded-md">
                <p className="text-foreground/90">{description}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {adminMode && (
        <div className="flex justify-end mt-4 gap-2">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(ebook)}
              className="transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edytuj
            </Button>
          )}
          {onDelete && <EbookDeleteButton onDelete={() => onDelete(ebook.id)} />}
        </div>
      )}
    </div>
  );
}
