
import { Button } from "@/components/ui/button";
import { BookOpenText, Edit, Trash, ChevronDown, Tag, BookText } from "lucide-react";
import { EbookCover } from "./EbookCover";
import { EbookDeleteButton } from "./EbookDeleteButton";
import { Badge } from "@/components/ui/badge";
import type { Ebook } from "../types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface EbookCardMobileProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
  showType?: boolean;
}

export function EbookCardMobile({
  ebook,
  onDelete,
  onEdit,
  adminMode = false,
  showType = false
}: EbookCardMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  // Format text to preserve line breaks
  const formatDescription = (text: string) => {
    if (!text) return "";
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };
  
  // Handle accordion toggle
  const handleToggleAccordion = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // If opened, scroll to the accordion
    if (newState) {
      setTimeout(() => {
        const element = document.getElementById(`accordion-${ebook.id}`);
        if (element) {
          // Scrolls with a bit of offset to place at the top
          window.scrollTo({
            top: element.offsetTop - 20,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3 text-center">{ebook.title}</h3>
      
      <div className="flex flex-col items-center space-y-4">
        <EbookCover 
          coverUrl={ebook.cover_url} 
          title={ebook.title} 
          size="small" 
          onClick={handleOpenPdf} 
        />
        
        <div className="w-[220px]">
          <Button 
            onClick={handleOpenPdf} 
            className="w-full transition-transform hover:scale-105"
          >
            <BookOpenText className="mr-2 h-4 w-4" />
            Czytaj
          </Button>
        </div>
        
        <Collapsible 
          open={isOpen} 
          onOpenChange={setIsOpen}
          className="w-full" 
          id={`accordion-${ebook.id}`}
        >
          <CollapsibleTrigger 
            onClick={handleToggleAccordion}
            className="flex items-center justify-between w-full p-2 bg-muted/30 rounded-t-md border-b"
          >
            <span className="font-medium">Szczegóły publikacji</span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="bg-muted/30 p-3 rounded-b-md">
            <div className="space-y-1">
              {ebook.page_count && (
                <div className="flex items-center gap-2">
                  <BookText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Liczba stron: {ebook.page_count}</span>
                </div>
              )}
              
              {showType && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{ebook.ebook_type}</span>
                </div>
              )}
            </div>
            
            {ebook.description && (
              <p className="text-sm mt-2 whitespace-pre-line">
                {formatDescription(ebook.description)}
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
        
        {adminMode && (
          <div className="flex gap-2 w-full">
            {onEdit && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onEdit(ebook)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edytuj
              </Button>
            )}
            
            {onDelete && (
              <EbookDeleteButton 
                onDelete={() => onDelete(ebook.id)} 
                className="flex-1" 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
