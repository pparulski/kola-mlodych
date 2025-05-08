
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
}

export function EbookCard({ ebook, onDelete, onEdit, adminMode = false, showType = false }: EbookCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card className="w-full mb-6 hover:shadow-md transition-all duration-300 animate-fade-in bg-[hsl(var(--content-box))] border border-border/50">
      {isMobile ? (
        <EbookCardMobile ebook={ebook} onDelete={onDelete} onEdit={onEdit} adminMode={adminMode} showType={showType} />
      ) : (
        <EbookCardDesktop ebook={ebook} onDelete={onDelete} onEdit={onEdit} adminMode={adminMode} showType={showType} />
      )}
    </Card>
  );
}
