
import { Facebook, Instagram, Mail, MapPin, Users } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Union } from "./types";

interface UnionCardProps {
  union: Union;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * UnionCard component to display a union's information in card format
 */
export const UnionCard = ({ union, isSelected, onSelect }: UnionCardProps) => {
  return (
    <Card 
      id={`union-card-${union.id}`}
      className={cn(
        "overflow-hidden transition-all duration-200",
        "hover:shadow-md",
        isSelected ? "ring-2 ring-primary/50" : ""
      )}
      onClick={onSelect}
      onMouseEnter={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl break-words">{union.name}</CardTitle>
            {union.city && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{union.city}</span>
              </div>
            )}
          </div>
          
          {union.logo_url && (
            <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center">
              <img 
                src={union.logo_url} 
                alt={`Logo ${union.name}`}
                className="max-h-16 max-w-16 object-contain"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3 pt-2">
        {union.year_created && (
          <Badge variant="outline" className="mb-3">
            <Users className="mr-1 h-3 w-3" />
            Rok założenia: {union.year_created}
          </Badge>
        )}
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="bio" className="border-0">
            <AccordionTrigger className="py-1 text-sm text-primary hover:no-underline">
              O organizacji
            </AccordionTrigger>
            <AccordionContent>
              {union.bio ? (
                <p className="text-sm text-muted-foreground">
                  {union.bio}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Brak szczegółowego opisu.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center space-x-2">
          {union.contact && (
            <a 
              href={`mailto:${union.contact}`}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              title={union.contact}
            >
              <Mail className="h-4 w-4" />
              <span className="hidden md:inline">Kontakt</span>
            </a>
          )}
        </div>

        <div className="flex gap-2">
          {union.facebook_url && (
            <a 
              href={union.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-primary transition-colors p-1 rounded-full hover:bg-accent/10"
              title="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          )}
          {union.instagram_url && (
            <a 
              href={union.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-primary transition-colors p-1 rounded-full hover:bg-accent/10"
              title="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
