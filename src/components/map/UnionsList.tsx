
import { Union } from "./types";
import { UnionCard } from "./UnionCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UnionsListProps {
  unions: Union[];
  selectedUnion: string | null;
  handleCardInteraction: (unionId: string) => void;
}

/**
 * UnionsList component that displays a list of UnionCards
 */
export const UnionsList = ({ 
  unions, 
  selectedUnion, 
  handleCardInteraction 
}: UnionsListProps) => {
  return (
    <ScrollArea className="h-full px-0.5 py-1">
      <div className="pr-0.5"> 
        {unions?.map((union) => (
          <UnionCard
            key={union.id}
            union={union}
            isSelected={selectedUnion === union.id}
            onSelect={() => handleCardInteraction(union.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
