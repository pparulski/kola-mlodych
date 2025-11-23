import React from "react"; // Ensure React is imported
import { Button } from "@/components/ui/button";
import { BookOpenText, Edit, Tag, BookText, ArrowRight } from "lucide-react";
import { EbookCover } from "./EbookCover";
import { EbookDeleteButton } from "./EbookDeleteButton";
import type { Ebook } from "../types";
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slugUtils";
import { UnifiedContentRenderer } from "@/components/content/UnifiedContentRenderer";

interface EbookCardMobileProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
  showType?: boolean;
  showDetails?: boolean;
  readLabel?: string;
}

export function EbookCardMobile({
  ebook,
  onDelete,
  onEdit,
  adminMode = false,
  showType = false,
  showDetails = false,
  readLabel = 'Czytaj'
}: EbookCardMobileProps) {
  const handleOpenPdf = () => {
    window.open(ebook.file_url, '_blank', 'noopener,noreferrer');
  };

  // Format text to preserve line breaks
  const formatDescription = (text: string) => {
    if (!text) return "";
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}> {/* Use React.Fragment for key */}
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3 text-center">
        <Link to={`/ebooks/${ebook.slug || slugify(ebook.title)}`} className="no-underline group inline-block">
          <span className="text-primary group-hover:text-accent transition-colors">{ebook.title}</span>
        </Link>
      </h3>
      
      <div className="flex flex-col items-center space-y-1.5">
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
            {readLabel || 'Czytaj'}
          </Button>
        </div>
        
        {/* Details area: either a button (listing) or details content (details page) */}
        {showDetails ? (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-3 text-sm mb-1">
              {showType && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>{ebook.ebook_type}</span>
                </div>
              )}
              {ebook.page_count && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookText className="h-4 w-4" />
                  <span>Liczba stron: {ebook.page_count}</span>
                </div>
              )}
            </div>
            {ebook.description && (
              <div className="px-2">
                <UnifiedContentRenderer 
                  content={ebook.description} 
                  applyProseStyles={true}
                  className="prose prose-sm dark:prose-invert text-justify"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-[220px]">
            <Button
              asChild
              variant="outline"
              className="w-full p-0 group transition-none hover:bg-background hover:text-current"
            >
              <Link
                to={`/ebooks/${ebook.slug || slugify(ebook.title)}`}
                className="inline-flex items-center justify-center no-underline"
                style={{ gap: 0 }}
              >
                Szczegóły publikacji
                <ArrowRight className="ml-1 h-4 w-4 transition-all duration-300 ease-in-out group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
        
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