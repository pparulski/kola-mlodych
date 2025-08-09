
import { Facebook, Instagram, Mail, Copy } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardFooter,
} from "@/components/ui/card";
import { cn, formatMailto } from "@/lib/utils";
import { Union } from "./types";
import { useState } from "react";

interface UnionCardProps {
  union: Union;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * UnionCard component to display a union's information in card format
 */
export const UnionCard = ({ union, isSelected, onSelect }: UnionCardProps) => {
  
  // Handle card click - select card
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on footer elements (contact links)
    if ((e.target as HTMLElement).closest('.card-footer')) {
      return;
    }
    
    // Select the card
    onSelect();
  };

  return (
    <Card 
      id={`union-card-${union.id}`}
      className={cn(
        "overflow-hidden transition-all duration-200 mb-0.5 mt-0.5",
        "hover:shadow-md hover:ring-2 hover:ring-primary/50",
        isSelected ? "ring-2 ring-primary/50" : ""
      )}
      onClick={handleCardClick}
      onMouseEnter={onSelect}
    >
      <CardHeader className="pb-1 pt-2 px-3 cursor-pointer">
        <CardTitle className="text-base break-words w-full">
          {union.name}
        </CardTitle>
      </CardHeader>

      {/* CardContent section removed since we're hiding the "O nas" accordion */}

      <CardFooter className="flex justify-between items-center pt-2 pb-2 px-3 border-t card-footer">
        <div className="flex items-center space-x-1">
         {union.contact && (
           <button
             onClick={async (e) => {
               e.stopPropagation();
               try {
                 await navigator.clipboard.writeText(union.contact!);
                 const btn = (e.currentTarget as HTMLButtonElement);
                 btn.classList.add('animate-scale-in');
                 setTimeout(() => btn.classList.remove('animate-scale-in'), 250);
               } catch (err) {
                 console.error('Copy failed');
               }
             }}
             aria-label="Skopiuj adres e-mail"
             title={union.contact}
             className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
           >
             <Mail className="h-3.5 w-3.5" />
             <span className="hidden md:inline">Kopiuj e-mail</span>
           </button>
         )}
        </div>

        <div className="flex gap-1">
         {union.facebook_url && (
            <a 
              href={union.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-primary transition-colors p-0.5 rounded-full hover:bg-accent/10"
              title="Facebook"
              aria-label="Otwórz stronę na Facebooku"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {union.instagram_url && (
            <a 
              href={union.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-primary transition-colors p-0.5 rounded-full hover:bg-accent/10"
              title="Instagram"
              aria-label="Otwórz profil na Instagramie"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
