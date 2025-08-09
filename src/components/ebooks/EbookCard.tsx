
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EbookCardMobile } from "./card/EbookCardMobile";
import { EbookCardDesktop } from "./card/EbookCardDesktop";
import { Ebook } from "./types";

export interface EbookCardProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
  showType?: boolean;
  showDetails?: boolean; // for mobile detail view to show description
  showMoreButton?: boolean; // controls visibility of "Więcej"
  truncateDescription?: boolean; // truncate desktop description in listings
}

export function EbookCard({ 
  ebook, 
  onDelete, 
  onEdit, 
  adminMode = false, 
  showType = false, 
  showDetails = false,
  showMoreButton,
  truncateDescription,
}: EbookCardProps) {
  const isMobile = useIsMobile();
  
  // Defaults: on public listing (adminMode=false), show more and truncate; on admin/details, hide/disable as needed
  const effectiveShowMore = showMoreButton ?? !adminMode;
  const effectiveTruncate = truncateDescription ?? !adminMode;
  
  return (
    <Card className="relative w-full hover:shadow-md transition-all duration-300 animate-fade-in bg-[hsl(var(--content-box))] border border-border/50">
      {isMobile ? (
        <EbookCardMobile 
          ebook={ebook} 
          onDelete={onDelete} 
          onEdit={onEdit} 
          adminMode={adminMode} 
          showType={showType} 
          showDetails={showDetails} 
        />
      ) : (
        <EbookCardDesktop 
          ebook={ebook} 
          onDelete={onDelete} 
          onEdit={onEdit} 
          adminMode={adminMode} 
          showType={showType} 
          showMoreButton={effectiveShowMore}
          truncateDescription={effectiveTruncate}
        />
      )}
    </Card>
  );
}
