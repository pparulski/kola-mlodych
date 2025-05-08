
// Update the EbookCardMobile.tsx file to ensure the "Czytaj" button's width scales properly with the cover

import { Button } from "@/components/ui/button";
import { BookOpenText, Edit, Trash } from "lucide-react";
import { EbookCover } from "./EbookCover";
import { EbookDeleteButton } from "./EbookDeleteButton";
import type { Ebook } from "../types";

interface EbookCardMobileProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
}

export function EbookCardMobile({
  ebook,
  onDelete,
  onEdit,
  adminMode = false
}: EbookCardMobileProps) {
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
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
        
        <div className="w-[220px]"> {/* Match the width with the cover (220px) */}
          <Button 
            onClick={handleOpenPdf} 
            className="w-full transition-transform hover:scale-105"
          >
            <BookOpenText className="mr-2 h-4 w-4" />
            Czytaj
          </Button>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-md w-full">
          <div className="space-y-1">
            {ebook.publication_year && (
              <p className="text-sm text-muted-foreground">
                Rok publikacji: {ebook.publication_year}
              </p>
            )}
            
            {ebook.page_count && (
              <p className="text-sm text-muted-foreground">
                Liczba stron: {ebook.page_count}
              </p>
            )}
          </div>
          
          {ebook.description && (
            <p className="text-sm mt-2 line-clamp-3">
              {ebook.description}
            </p>
          )}
        </div>
        
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
