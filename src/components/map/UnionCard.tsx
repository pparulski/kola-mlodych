
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardFooter,
} from "@/components/ui/card";
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
        "overflow-hidden transition-all duration-200 mb-1",
        "hover:shadow-md",
        isSelected ? "ring-2 ring-primary/50" : ""
      )}
      onClick={onSelect}
      onMouseEnter={onSelect}
    >
      <CardHeader className="pb-1 pt-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base break-words w-full">{union.name}</CardTitle>
        </div>
        {union.city && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="h-3 w-3" />
            <span>{union.city}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pb-2 pt-1 px-3">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="bio" className="border-0">
            <AccordionTrigger className="py-0.5 text-xs text-primary hover:no-underline">
              O organizacji
            </AccordionTrigger>
            <AccordionContent>
              {union.bio ? (
                <p className="text-xs text-muted-foreground">
                  {union.bio}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Brak szczegółowego opisu.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-1 pb-2 px-3 border-t">
        <div className="flex items-center space-x-1">
          {union.contact && (
            <a 
              href={`mailto:${union.contact}`}
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              title={union.contact}
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Kontakt</span>
            </a>
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
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
